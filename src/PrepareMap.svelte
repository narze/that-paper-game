<script lang="ts">
  import type { svelteSyncedStore } from "@syncedstore/svelte"

  import { onMount, onDestroy } from "svelte"
  import type { svelteStore } from "./lib/synced-store"
  import { player } from "./lib/player-store"

  export let store: typeof svelteStore
  export let nextState: () => void

  const players = $store.players
  // const playerId = $player.id

  // $: roomPlayers = Object.values($store.roomPlayers)
</script>

<div class="prepare">
  <h2 class="text-xl">Prepare</h2>

  <div class="players">
    <h2 class="text-lg">Players</h2>

    <ul>
      {#each players as player, idx}
        <li>#{idx + 1}: {player.name}</li>
      {/each}
    </ul>
  </div>
</div>
