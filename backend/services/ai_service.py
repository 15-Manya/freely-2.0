"""
AI service for risk analysis and proposal generation using OpenAI.
"""
import os
from dotenv import load_dotenv
from openai import OpenAI
from services.risk_analysis_service import (
    format_risk_analysis_prompt,
    parse_risk_analysis_response,
    validate_risk_analysis
)
from services.proposal_service import (
    format_proposal_prompt,
    parse_proposal_response,
    validate_proposal,
    format_proposal_update_prompt,
    parse_proposal_update_response
)

# Load environment variables
load_dotenv()

# Initialize OpenAI client
# Check both OPENAI_API_KEY and OPENAI_API (for compatibility)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = None

if OPENAI_API_KEY and OPENAI_API_KEY != "your-openai-api-key-here" and OPENAI_API_KEY.strip():
    client = OpenAI(api_key=OPENAI_API_KEY)
    print("✅ OpenAI client initialized successfully")
    print(f"   API key loaded: {OPENAI_API_KEY[:10]}...{OPENAI_API_KEY[-4:]}")
else:
    print("⚠️  OPENAI_API_KEY not set or still placeholder. AI analysis will not work.")
    if OPENAI_API_KEY:
        print(f"   Current value appears to be a placeholder or empty")


async def analyze_client_chat(client_chat: str) -> dict:
    """
    Analyze client chat using AI and return risk analysis.
    
    Args:
        client_chat: The client chat conversation text
        
    Returns:
        Risk analysis dictionary with all analysis results
        
    Raises:
        ValueError: If OpenAI API key is not set or analysis fails
    """
    if not client:
        raise ValueError("OpenAI API key not configured. Please set OPENAI_API_KEY in .env file.")
    
    if not client_chat or not client_chat.strip():
        raise ValueError("Client chat content is empty.")
    
    # Format the prompt
    prompt = format_risk_analysis_prompt(client_chat)
    
    try:
        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o",  # Using GPT-4 for better analysis
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that provides risk analysis in JSON format."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            response_format={"type": "json_object"}  # Force JSON response
        )
        
        # Extract response text
        response_text = response.choices[0].message.content
        
        # Parse and validate the response
        analysis = parse_risk_analysis_response(response_text)
        validate_risk_analysis(analysis)
        
        return analysis
        
    except Exception as e:
        error_msg = str(e)
        if "API key" in error_msg or "authentication" in error_msg.lower():
            raise ValueError("OpenAI API authentication failed. Please check your API key.")
        elif "rate limit" in error_msg.lower():
            raise ValueError("OpenAI API rate limit exceeded. Please try again later.")
        else:
            raise ValueError(f"AI analysis failed: {error_msg}")


async def generate_proposal(client_chat: str) -> dict:
    """
    Generate a professional job proposal from client chat using AI.
    
    Args:
        client_chat: The client chat conversation text
        
    Returns:
        Proposal dictionary with all proposal sections and formatted proposal
        
    Raises:
        ValueError: If OpenAI API key is not set or proposal generation fails
    """
    if not client:
        raise ValueError("OpenAI API key not configured. Please set OPENAI_API_KEY in .env file.")
    
    if not client_chat or not client_chat.strip():
        raise ValueError("Client chat content is empty.")
    
    # Format the prompt
    prompt = format_proposal_prompt(client_chat)
    
    try:
        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o",  # Using GPT-4o for better proposal generation
            messages=[
                {
                    "role": "system",
                    "content": "You are an Expert Freelance Proposal Strategist. Generate professional job proposals in JSON format based on client chats."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            response_format={"type": "json_object"}  # Force JSON response
        )
        
        # Extract response text
        response_text = response.choices[0].message.content
        
        # Parse and validate the response
        proposal = parse_proposal_response(response_text)
        validate_proposal(proposal)
        
        return proposal
        
    except Exception as e:
        error_msg = str(e)
        if "API key" in error_msg or "authentication" in error_msg.lower():
            raise ValueError("OpenAI API authentication failed. Please check your API key.")
        elif "rate limit" in error_msg.lower():
            raise ValueError("OpenAI API rate limit exceeded. Please try again later.")
        else:
            raise ValueError(f"AI proposal generation failed: {error_msg}")


async def update_proposal(current_proposal: str, user_changes: str, new_chat_content: str = None) -> str:
    """
    Update an existing proposal based on user-specified changes using AI.
    
    Args:
        current_proposal: The current proposal draft (formatted_proposal string)
        user_changes: The user's requested changes/additional information
        new_chat_content: Optional new chat content if a file was uploaded
        
    Returns:
        Updated proposal text (formatted_proposal string)
        
    Raises:
        ValueError: If OpenAI API key is not set or update fails
    """
    if not client:
        raise ValueError("OpenAI API key not configured. Please set OPENAI_API_KEY in .env file.")
    
    if not current_proposal or not current_proposal.strip():
        raise ValueError("Current proposal content is empty.")
    
    if not user_changes or not user_changes.strip():
        raise ValueError("User changes are empty. Please specify what you want to update.")
    
    # Format the prompt
    prompt = format_proposal_update_prompt(current_proposal, user_changes, new_chat_content)
    
    try:
        # Call OpenAI API
        # Note: We're not using JSON format here since we want the updated proposal as markdown text
        response = client.chat.completions.create(
            model="gpt-4o",  # Using GPT-4o for better proposal updates
            messages=[
                {
                    "role": "system",
                    "content": "You are an Expert Freelance Proposal Editor. Update proposals based on user instructions, making only the requested changes and preserving all other content."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,  # Lower temperature for more precise, focused updates
        )
        
        # Extract response text
        response_text = response.choices[0].message.content
        
        # Parse the response to get the updated proposal
        updated_proposal = parse_proposal_update_response(response_text)
        
        if not updated_proposal or not updated_proposal.strip():
            raise ValueError("AI returned an empty proposal update.")
        
        return updated_proposal
        
    except Exception as e:
        error_msg = str(e)
        if "API key" in error_msg or "authentication" in error_msg.lower():
            raise ValueError("OpenAI API authentication failed. Please check your API key.")
        elif "rate limit" in error_msg.lower():
            raise ValueError("OpenAI API rate limit exceeded. Please try again later.")
        else:
            raise ValueError(f"AI proposal update failed: {error_msg}")

