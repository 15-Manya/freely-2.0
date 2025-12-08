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

        # Validate required fields
        required_fields = [
            "job_overview",
            "summary_of_job_description",
            "requirements_and_scope",
            "ambiguity_and_loopholes",
            "timeline_and_milestones",
            "budget_and_payment_terms",
            "additional_notes",
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
        "job_overview",
        "summary_of_job_description",
        "requirements_and_scope",
        "ambiguity_and_loopholes",
        "timeline_and_milestones",
        "budget_and_payment_terms",
        "additional_notes",
        "formatted_proposal"
    ]
    
    for section in required_sections:
        if section not in proposal:
            raise ValueError(f"Missing required section: {section}")
    
    # Validate job_overview structure
    job_overview = proposal.get("job_overview", {})
    required_overview_fields = ["project_job_title", "client_name", "client_contact_info", "date_of_analysis"]
    for field in required_overview_fields:
        if field not in job_overview:
            raise ValueError(f"Missing required field in job_overview: {field}")
    
    # Validate formatted_proposal is a string
    if not isinstance(proposal.get("formatted_proposal"), str):
        raise ValueError("formatted_proposal must be a string")
    
    # Validate ambiguity_and_loopholes has arrays with content (CRITICAL SECTION)
    ambiguity = proposal.get("ambiguity_and_loopholes", {})
    if not isinstance(ambiguity, dict):
        raise ValueError("ambiguity_and_loopholes must be an object/dictionary")
    
    unclear_requirements = ambiguity.get("unclear_missing_conflicting_requirements", [])
    if not isinstance(unclear_requirements, list):
        raise ValueError("unclear_missing_conflicting_requirements must be an array")
    if len(unclear_requirements) < 3:
        raise ValueError(f"unclear_missing_conflicting_requirements must have at least 3 items (found {len(unclear_requirements)}). This is a critical section and cannot be empty or minimal.")
    if any(not item or not isinstance(item, str) or len(item.strip()) < 20 for item in unclear_requirements):
        raise ValueError("Each item in unclear_missing_conflicting_requirements must be a non-empty string with at least 20 characters. Generic or empty items are not acceptable.")
    
    clarification_questions = ambiguity.get("client_questions_for_clarification", [])
    if not isinstance(clarification_questions, list):
        raise ValueError("client_questions_for_clarification must be an array")
    if len(clarification_questions) < 3:
        raise ValueError(f"client_questions_for_clarification must have at least 3 items (found {len(clarification_questions)}). This is a critical section and cannot be empty or minimal.")
    if any(not item or not isinstance(item, str) or len(item.strip()) < 20 for item in clarification_questions):
        raise ValueError("Each item in client_questions_for_clarification must be a non-empty string with at least 20 characters. Generic or empty questions are not acceptable.")
    
    # Validate budget_and_payment_terms has negotiation_points array
    budget = proposal.get("budget_and_payment_terms", {})
    if not isinstance(budget.get("suggested_negotiation_points", []), list):
        raise ValueError("suggested_negotiation_points must be an array")
    
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

