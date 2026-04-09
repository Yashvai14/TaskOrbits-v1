import json
import os
import requests
from datetime import datetime, timezone
from typing import Dict, Any, TypedDict, Literal, List
from langchain_ollama import OllamaLLM
from langgraph.graph import StateGraph, END
from agent.prompts import VALIDATION_PROMPT, EXTRACTION_PROMPT, SCORING_PROMPT

NEXTJS_URL = os.getenv("NEXTJS_URL", "http://localhost:3000")
INTERNAL_API_SECRET = os.getenv("INTERNAL_API_SECRET", "super-secret-key-123")

def fetch_team_members() -> List[Dict]:
    """Fetch all users from Next.js to build assignee context for the LLM."""
    try:
        response = requests.get(
            f"{NEXTJS_URL}/api/team/members",
            headers={"Authorization": f"Bearer {INTERNAL_API_SECRET}"},
            timeout=5
        )
        if response.ok:
            return response.json().get("users", [])
    except Exception as e:
        print(f"[workflow] Could not fetch team members: {e}")
    return []

def build_assignee_map(users: List[Dict]) -> str:
    """Format user list into a compact string the LLM can parse."""
    if not users:
        return "No team members registered yet."
    lines = []
    for u in users:
        name = u.get("name") or u.get("email", "Unknown")
        lines.append(f"- {name}: {u['id']}")
    return "\n".join(lines)

# State Definition
class GraphState(TypedDict):
    source_message: str
    source_type: str
    source_id: str
    is_task: bool
    validation_reason: str
    extracted_task: Dict[str, Any]
    confidence_score: float
    scoring_reason: str
    decision: str  # 'auto-created', 'pending-review', 'rejected', 'discarded'

# LLM Setup - Using phi3 due to VRAM constraints
llm = OllamaLLM(model="phi3", format="json") # forcing json format for agent extractions
chat_llm = OllamaLLM(model="phi3") # regular text LLM for natural language queries and insights

def validation_node(state: GraphState) -> GraphState:
    prompt = VALIDATION_PROMPT.format(message=state['source_message'])
    try:
        response = llm.invoke(prompt)
        data = json.loads(response)
        state['is_task'] = data.get("is_task", False)
        state['validation_reason'] = data.get("reason", "")
    except Exception as e:
        print(f"Validation Error: {e}")
        state['is_task'] = False
    return state

def extraction_node(state: GraphState) -> GraphState:
    # Inject live UTC timestamp and team members on every call
    current_datetime = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    users = fetch_team_members()
    valid_assignees = build_assignee_map(users)
    
    prompt = EXTRACTION_PROMPT.format(
        message=state['source_message'],
        current_datetime=current_datetime,
        valid_assignees=valid_assignees
    )
    try:
        response = llm.invoke(prompt)
        data = json.loads(response)
        state['extracted_task'] = data
    except Exception as e:
        print(f"Extraction Error: {e}")
        state['extracted_task'] = None
    return state

def scoring_node(state: GraphState) -> GraphState:
    if not state.get('extracted_task'):
        state['confidence_score'] = 0.0
        return state
        
    prompt = SCORING_PROMPT.format(
        message=state['source_message'],
        extracted_task=json.dumps(state['extracted_task'])
    )
    try:
        response = llm.invoke(prompt)
        data = json.loads(response)
        state['confidence_score'] = float(data.get("confidenceScore", 0.0))
        state['scoring_reason'] = data.get("scoringReason", "")
    except Exception as e:
        print(f"Scoring Error: {e}")
        state['confidence_score'] = 0.0
    return state

def decision_node(state: GraphState) -> GraphState:
    score = state.get('confidence_score', 0.0)
    if score >= 70.0:
        state['decision'] = 'auto-created'
    elif score >= 60.0:
        state['decision'] = 'pending-review'
    else:
        state['decision'] = 'rejected'
        state['is_task'] = False # As per user feedback, < 0.6 -> set is_task = false
    return state

def route_validation(state: GraphState) -> Literal["extraction_node", "end"]:
    if state.get('is_task'):
        return "extraction_node"
    return "end"

# Build Graph
builder = StateGraph(GraphState)
builder.add_node("validation_node", validation_node)
builder.add_node("extraction_node", extraction_node)
builder.add_node("scoring_node", scoring_node)
builder.add_node("decision_node", decision_node)

builder.set_entry_point("validation_node")
builder.add_conditional_edges("validation_node", route_validation, {
    "extraction_node": "extraction_node",
    "end": END
})
builder.add_edge("extraction_node", "scoring_node")
builder.add_edge("scoring_node", "decision_node")
builder.add_edge("decision_node", END)

workflow = builder.compile()

def process_message(source_message: str, source_type: str, source_id: str) -> GraphState:
    initial_state = {
        "source_message": source_message,
        "source_type": source_type,
        "source_id": source_id,
        "is_task": False,
        "validation_reason": "",
        "extracted_task": {},
        "confidence_score": 0.0,
        "scoring_reason": "",
        "decision": "discarded"
    }
    result = workflow.invoke(initial_state)
    return result
