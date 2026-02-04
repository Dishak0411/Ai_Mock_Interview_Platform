import aiohttp
import asyncio

async def list_models():
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get('http://localhost:11434/api/tags') as resp:
                if resp.status == 200:
                    data = await resp.json()
                    print("Available Models:")
                    for model in data.get('models', []):
                        print(f" - {model['name']}")
                else:
                    print(f"Error fetching models: {resp.status}")
        except Exception as e:
            print(f"Connection error: {e}")

if __name__ == "__main__":
    asyncio.run(list_models())
