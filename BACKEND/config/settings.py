from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    
    PROJECT_NAME: str = "AI Voice Assistant"
    API_V1_STR: str = "/api/v1"
    
    # AI Keys
    GROQ_API_KEY: str = ""
    ELEVENLABS_API_KEY: str = ""

    # STT Configuration
    STT_MODEL: str = "whisper-large-v3"
    STT_DURATION_THRESHOLD: float = 0.0
    
    # LLM Configuration
    LLM_MODEL: str = "openai/gpt-oss-120b"
    INTENT_MODEL: str = "llama-3.3-70b-versatile"
    STT_CORRECTION_MODEL: str = "llama-3.3-70b-versatile"
    LLM_TEMPERATURE: float = 0.7
    LLM_MAX_TOKENS: int = 700

    # Memory Configuration
    MEMORY_MAX_MESSAGES: int = 50

    # TTS Configuration
    STATIC_DIR: str = "static"
    TTS_OUTPUT_DIR: str = "static/audio"
    REFERENCE_VOICES_DIR: str = "static/references"
    
settings = Settings()
