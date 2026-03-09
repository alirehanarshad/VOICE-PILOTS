import asyncio
import edge_tts
import os

VOICE_MAP = {
    "Sofia": ("en-US-AvaNeural", "Hello! I am Sofia, your neural companion."),
    "Dutch": ("en-US-AndrewNeural", "Dutch here. Systems are optimized and ready for deployment."),
    "Eva": ("en-US-EmmaNeural", "Eva here. I've organized your schedule for maximum efficiency."),
    "Zoya": ("ur-IN-GulNeural", "السلام علیکم! میں زویا ہوں۔ میں آپ کی اردو اسپیشلسٹ ہوں اور آپ کی بہتر مدد کے لیے تیار ہوں۔"),
    "Aarav": ("hi-IN-SwaraNeural", "नमस्ते! मैं आरव हूँ, आपका हिंदी असिस्टेंट।")
}

OUTPUT_DIR = "static/references"

async def recreate_voices():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    for agent, (voice, text) in VOICE_MAP.items():
        print(f"Generating voice for {agent} ({voice})...")
        output_path = os.path.join(OUTPUT_DIR, f"{agent.lower()}_agent.wav")
        
        # Use edge-tts to generate
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(output_path)
        print(f"  Saved to {output_path}")

if __name__ == "__main__":
    asyncio.run(recreate_voices())
