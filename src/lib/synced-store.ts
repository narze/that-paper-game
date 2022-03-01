import { syncedStore, getYjsValue } from "@syncedstore/core"
import { WebrtcProvider } from "y-webrtc"
import { svelteSyncedStore } from "@syncedstore/svelte"
import { writable } from "svelte/store"

export interface RoomPlayer {
  id: string
  name: string
  ready: boolean
  admin: boolean
  enteredAt: number
}

export interface GamePlayer {
  id: string
  name: string
  x?: number
  y?: number
  direction?: "up" | "down" | "left" | "right"
  color?: string
  hp?: number
}

export enum GameState {
  Waiting,
  Prepare,
  Start,
  Ended,
}

// Create your SyncedStore store
export const store = syncedStore({
  todos: [],
  fragment: "xml",
  players: [] as GamePlayer[],
  roomPlayers: {} as Record<string, RoomPlayer>,
  roomOwnerIds: [],
  gameData: {} as Record<string, any>,
})
export const svelteStore = svelteSyncedStore(store)
export const synced = writable(false)
export const connected = writable(false)
export const peers = writable([])

// Create a document that syncs automatically using Y-WebRTC
const doc = getYjsValue(store)

export const connectRoom = (roomId: string) => {
  const webrtcProvider = new WebrtcProvider(
    `that-paper-game-${roomId}`,
    doc as any,
    // {
    //   config: {
    //     reconnectTimer: 100,
    //     iceTransportPolicy: "relay",
    //     trickle: false,
    //     // iceServers: [
    //     //   { urls: "stun:stun.l.google.com:19302" },
    //     //   { urls: "stun:global.stun.twilio.com:3478?transport=udp" },
    //     //   { urls: "stun:stun1.l.google.com:19302" },
    //     //   { urls: "stun:stun2.l.google.com:19302" },
    //     //   { urls: "stun:stun3.l.google.com:19302" },
    //     //   { urls: "stun:stun4.l.google.com:19302" },
    //     // ],
    //   },
    // } as any
  )

  let connectInterval

  connectInterval = setInterval(() => {
    if (webrtcProvider.connected) {
      // webrtcProvider.doc.on("update", () => {
      //   console.log("doc updated")
      //   connected.set(true)
      // })
      // webrtcProvider.doc
      //   .getMap("tmp")
      //   .set(`${webrtcProvider.doc.clientID}`, true)

      console.log("connected")
      connected.set(true)

      clearInterval(connectInterval)
    }
  }, 100)

  webrtcProvider.on("synced", (args) => {
    console.log("synced", args)
    synced.set(true)
  })

  webrtcProvider.on("peers", (p) => {
    peers.set(p?.webrtcPeers ?? [])
  })

  return webrtcProvider
}
