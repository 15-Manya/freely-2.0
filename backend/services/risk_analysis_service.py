"""
Service for performing risk analysis on client chats using AI.
"""
from prompts.risk_analysis_prompt import RISK_ANALYSIS_PROMPT
import json


def format_risk_analysis_prompt(client_chat: str) -> str:
    """
    Format the risk analysis prompt with the client chat content.
    
    Args:
        client_chat: The client chat conversation text
        
    Returns:
        Formatted prompt string ready to send to AI
    """
    return RISK_ANALYSIS_PROMPT.format(client_chat=client_chat)


def parse_risk_analysis_response(response_text: str) -> dict:
    """
    Parse the AI response and extract the JSON risk analysis.
    
    Args:
        response_text: Raw response from AI
        
    Returns:
        Parsed risk analysis dictionary
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
        analysis = json.loads(json_str)
        
        # Validate required fields
        required_fields = [
            "risk_score", "risk_level", "risk_meter", "executive_summary",
            "pros", "cons", "recommendation"
        ]
        for field in required_fields:
            if field not in analysis:
                raise ValueError(f"Missing required field: {field}")
        
        return analysis
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse JSON from AI response: {e}")
    except Exception as e:
        raise ValueError(f"Failed to parse risk analysis response: {e}")


def get_risk_meter_emoji(score: int) -> str:
    """
    Get the appropriate emoji for the risk score.
    
    Args:
        score: Risk score from 1-10
        
    Returns:
        Emoji string (🟢, 🟡, or 🔴)
    """
    if score <= 3:
        return "🟢"
    elif score <= 6:
        return "🟡"
    else:
        return "🔴"


def validate_risk_analysis(analysis: dict) -> bool:
    """
    Validate that the risk analysis has all required fields and valid values.
    
    Args:
        analysis: Risk analysis dictionary
        
    Returns:
        True if valid, raises ValueError if invalid
    """
    # Check risk score is in valid range
    risk_score = analysis.get("risk_score")
    if not isinstance(risk_score, int) or risk_score < 1 or risk_score > 10:
        raise ValueError(f"Invalid risk_score: {risk_score}. Must be integer between 1-10")
    
    # Check risk level matches score
    risk_level = analysis.get("risk_level")
    if risk_score <= 3 and risk_level != "GREEN":
        raise ValueError(f"Risk level should be GREEN for score {risk_score}")
    elif 4 <= risk_score <= 6 and risk_level != "YELLOW":
        raise ValueError(f"Risk level should be YELLOW for score {risk_score}")
    elif risk_score >= 7 and risk_level != "RED":
        raise ValueError(f"Risk level should be RED for score {risk_score}")
    
    # Check recommendation is valid
    valid_recommendations = ["ACCEPT", "PROCEED WITH CAUTION", "DECLINE", "RENEGOTIATE"]
    recommendation = analysis.get("recommendation")
    if recommendation not in valid_recommendations:
        raise ValueError(f"Invalid recommendation: {recommendation}")
    
    return True

