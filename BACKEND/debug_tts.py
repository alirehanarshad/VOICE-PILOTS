import asyncio
import edge_tts

async def test_tts():
    text = "Hello, this is a test of edge tts."
    voice = "en-US-AvaNeural"
    try:
        communicate = edge_tts.Communicate(text, voice, rate="+20%")
        async for chunk in communicate.stream():
            print(f"Chunk type: {chunk['type']}")
            if chunk['type'] == 'WordBoundary':
                print(f"  Word: {chunk['text']} at {chunk['offset']}")
        print("Test successful!")
    except Exception as e:
        print(f"Test failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_tts())
