"""
Service for generating professional job proposals from client chats using AI.
"""
from prompts.proposal_prompt import PROPOSAL_GENERATION_PROMPT
from prompts.proposal_update_prompt import PROPOSAL_UPDATE_PROMPT
import json
from datetime import datetime


def format_proposal_prompt(client_chat: str) -> str:
    """
    Format the proposal generation prompt with the client chat content.

    Args:
        client_chat: The client chat conversation text

    Returns:
        Formatted prompt string ready to send to AI
    """
    return PROPOSAL_GENERATION_PROMPT.format(client_chat=client_chat)


def parse_proposal_response(response_text: str) -> dict:
    """
    Parse the AI response and extract the JSON proposal.

    Args:
        response_text: Raw response from AI

    Returns:
        Parsed proposal dictionary
    """
    try:
        # Try to extract JSON from the response
        # AI might wrap JSON in markdown code blocks
        if "```json" in response_text:
            # Extract JSON from markdown code block
            start = response_text.find("```json") + 7
            end = response_text.find("```", start)
            json_str = response_text[start:end].strip()
        elif "```" in response_text:
            # Extract from generic code block
            start = response_text.find("```") + 3
            end = response_text.find("```", start)
            json_str = response_text[start:end].strip()
        else:
            # Try to find JSON object in the response
            start = response_text.find("{")
            end = response_text.rfind("}") + 1
            json_str = response_text[start:end]

        # Parse JSON
        proposal = json.loads(json_str)

        # Validate required top-level fields
        required_fields = [
            "project_analysis",
            "proposal_data",
            "formatted_proposal"
        ]
        for field in required_fields:
            if field not in proposal:
                raise ValueError(f"Missing required field: {field}")

        return proposal
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse JSON from AI response: {e}")
    except Exception as e:
        raise ValueError(f"Failed to parse proposal response: {e}")


def validate_proposal(proposal: dict) -> bool:
    """
    Validate that the proposal has all required fields and valid structure.

    Args:
        proposal: Proposal dictionary

    Returns:
        True if valid, raises ValueError if invalid
    """
    # Check required top-level sections
    required_sections = [
        "project_analysis",
        "proposal_data",
        "formatted_proposal"
    ]
    
    for section in required_sections:
        if section not in proposal:
            raise ValueError(f"Missing required section: {section}")
    
    # Validate project_analysis structure
    project_analysis = proposal.get("project_analysis", {})
    if not isinstance(project_analysis, dict):
        raise ValueError("project_analysis must be an object/dictionary")
    
    required_analysis_fields = [
        "client_goals",
        "identified_risks_and_ambiguities",
        "questions_for_clarification"
    ]
    for field in required_analysis_fields:
        if field not in project_analysis:
            raise ValueError(f"Missing required field in project_analysis: {field}")
    
    # Validate identified_risks_and_ambiguities (CRITICAL SECTION)
    identified_risks = project_analysis.get("identified_risks_and_ambiguities", [])
    if not isinstance(identified_risks, list):
        raise ValueError("identified_risks_and_ambiguities must be an array")
    if len(identified_risks) < 3:
        raise ValueError(f"identified_risks_and_ambiguities must have at least 3 items (found {len(identified_risks)}). This is a critical section and cannot be empty or minimal.")
    if any(not item or not isinstance(item, str) or len(item.strip()) < 20 for item in identified_risks):
        raise ValueError("Each item in identified_risks_and_ambiguities must be a non-empty string with at least 20 characters. Generic or empty items are not acceptable.")
    
    # Validate questions_for_clarification (CRITICAL SECTION)
    clarification_questions = project_analysis.get("questions_for_clarification", [])
    if not isinstance(clarification_questions, list):
        raise ValueError("questions_for_clarification must be an array")
    if len(clarification_questions) < 3:
        raise ValueError(f"questions_for_clarification must have at least 3 items (found {len(clarification_questions)}). This is a critical section and cannot be empty or minimal.")
    if any(not item or not isinstance(item, str) or len(item.strip()) < 20 for item in clarification_questions):
        raise ValueError("Each item in questions_for_clarification must be a non-empty string with at least 20 characters. Generic or empty questions are not acceptable.")
    
    # Validate proposal_data structure
    proposal_data = proposal.get("proposal_data", {})
    if not isinstance(proposal_data, dict):
        raise ValueError("proposal_data must be an object/dictionary")
    
    required_data_fields = [
        "project_details",
        "project_goals",
        "scope_deliverables",
        "process_steps",
        "client_requirements",
        "timeline",
        "pricing"
    ]
    for field in required_data_fields:
        if field not in proposal_data:
            raise ValueError(f"Missing required field in proposal_data: {field}")
    
    # Validate arrays in proposal_data
    scope_deliverables = proposal_data.get("scope_deliverables", [])
    if not isinstance(scope_deliverables, list):
        raise ValueError("scope_deliverables must be an array")
    
    process_steps = proposal_data.get("process_steps", [])
    if not isinstance(process_steps, list):
        raise ValueError("process_steps must be an array")
    
    client_requirements = proposal_data.get("client_requirements", [])
    if not isinstance(client_requirements, list):
        raise ValueError("client_requirements must be an array")
    
    # Validate formatted_proposal is a string
    if not isinstance(proposal.get("formatted_proposal"), str):
        raise ValueError("formatted_proposal must be a string")
    if not proposal.get("formatted_proposal").strip():
        raise ValueError("formatted_proposal cannot be empty")
    
    return True


def format_proposal_update_prompt(current_proposal: str, user_changes: str, new_chat_content: str = None) -> str:
    """
    Format the proposal update prompt with the current proposal and user changes.

    Args:
        current_proposal: The current proposal draft (formatted_proposal string)
        user_changes: The user's requested changes/additional information
        new_chat_content: Optional new chat content if a file was uploaded

    Returns:
        Formatted prompt string ready to send to AI
    """
    # If new_chat_content is not provided or empty, use empty string
    new_chat = new_chat_content if new_chat_content else ""
    
    return PROPOSAL_UPDATE_PROMPT.format(
        current_proposal=current_proposal,
        user_changes=user_changes,
        new_chat_content=new_chat
    )


def parse_proposal_update_response(response_text: str) -> str:
    """
    Parse the AI response and extract the updated proposal text.
    Since the update prompt returns just the updated proposal (not JSON),
    we extract the formatted_proposal text directly.

    Args:
        response_text: Raw response from AI

    Returns:
        Updated proposal text (formatted_proposal string)
    """
    try:
        # The AI should return the updated proposal directly as markdown text
        # Remove any markdown code blocks if present
        if "```markdown" in response_text:
            start = response_text.find("```markdown") + 11
            end = response_text.find("```", start)
            return response_text[start:end].strip()
        elif "```" in response_text:
            # Extract from generic code block
            start = response_text.find("```") + 3
            end = response_text.find("```", start)
            return response_text[start:end].strip()
        else:
            # Return the response as-is (should be the updated proposal)
            return response_text.strip()
    except Exception as e:
        raise ValueError(f"Failed to parse proposal update response: {e}")

