import asyncio
import os
import json
import edge_tts
from edge_tts import Communicate

VOICE = "en-US-GuyNeural" # Professional, calm, confident, technically literate
RATE = "+0%"
PITCH = "+0Hz"

SEGMENTS = [
    {
        "id": "01_hook",
        "text": "Market buying is not always the cheapest way to execute the same Binance intent. Pathwise checks the paths first.",
        "target_start": 0.0
    },
    {
        "id": "02_intro",
        "text": "Pathwise is an execution operator for Binance Agent OS. You tell it what you want done; it prices the available routes after fees, Convert, wallet location and funding, then deterministically selects one winner.",
        "target_start": 8.0
    },
    {
        "id": "03_intent",
        "text": "Here's the intent: buy two hundred USDT of SOL and hold it for twenty-four hours. Pathwise turns that sentence into a constrained execution problem. It isn't deciding whether SOL goes up. It is deciding how to execute the intent efficiently.",
        "target_start": 20.0
    },
    {
        "id": "04_wallet",
        "text": "First, Pathwise looks at where the capital actually sits. Spot and USD-M are different execution pockets, so moving funds can itself be part of the route.",
        "target_start": 33.0
    },
    {
        "id": "05_scoring",
        "text": "Now the important part. Pathwise does not ask an LLM to guess the best route. Its deterministic scorer enumerates the legal paths and puts them in the same unit: all-in USDT cost. That can include spread, fees, book impact, Convert pricing, funding across the hold horizon, and any wallet transfer required to make the route executable. Unsupported paths stay visible rather than being silently replaced.",
        "target_start": 47.0
    },
    {
        "id": "06_hero",
        "text": "For this recorded fixture, Binance Convert wins. The same two-hundred-dollar intent is estimated at seventeen cents less than the Spot market baseline. The route is selected by the score, not by the model.",
        "target_start": 74.0
    },
    {
        "id": "07_execute",
        "text": "In this submission environment, the execution is reproduced as a recorded fixture, so no real fill is claimed. Once approved, Pathwise evaluates only the winning plan, without spraying unverified orders.",
        "target_start": 96.0
    },
    {
        "id": "08_receipt",
        "text": "Choosing the route isn't enough. Pathwise writes a receipt containing the original intent, every scored path, the selected winner, and the evidence behind the result. That receipt can be recomputed from its recorded inputs, so the cents result does not depend on trusting the narration.",
        "target_start": 116.0
    },
    {
        "id": "09_mechanism",
        "text": "The agent's job here is operational, not advisory. Binance supplies the account and market primitives; Pathwise turns those primitives into one deterministic execution decision. The key insight is that Convert and internal wallet transfers aren't setup steps. They're competing execution legs with their own costs and clocks.",
        "target_start": 140.0
    },
    {
        "id": "10_campaign",
        "text": "And the evaluation doesn't have to stop at one favorable screenshot. The campaign runner freezes the comparison set in advance across five assets, notionals, and horizons, keeping the losses and blocked routes too.",
        "target_start": 160.0
    },
    {
        "id": "11_outro",
        "text": "Pathwise. One intent. Every viable path. Every cent accounted for.",
        "target_start": 171.0
    }
]

async def generate():
    os.makedirs("public/audio", exist_ok=True)
    manifest = []
    
    for seg in SEGMENTS:
        out_file = f"public/audio/{seg['id']}.mp3"
        print(f"Generating {seg['id']}...")
        comm = Communicate(seg["text"], VOICE, rate=RATE, pitch=PITCH)
        await comm.save(out_file)
        manifest.append({
            "id": seg["id"],
            "file": out_file,
            "text": seg["text"],
            "target_start": seg["target_start"]
        })
        
    with open("public/audio/manifest.json", "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print("All audio segments generated!")

if __name__ == "__main__":
    asyncio.run(generate())
