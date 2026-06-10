'use client'

// Renders the ElevenLabs conversational AI widget as a real custom element.
// dangerouslySetInnerHTML is used so React doesn't try to type-check the
// unknown "elevenlabs-convai" tag — the element is hydrated by the CDN script.
export default function ElevenLabsWidget() {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html:
          '<elevenlabs-convai agent-id="agent_5601ktsnn8vpf7esn50ynngxpach"></elevenlabs-convai>',
      }}
    />
  )
}
