<script lang="ts">
  import { nanoid } from "nanoid"

  import Room from "./Room.svelte"
  import url from "./lib/url"
  let roomId = ""

  function createNewRoom() {
    const newRoomId = nanoid()
    window.location.hash = `#/rooms/${newRoomId}`
  }

  function joinRoom() {
    window.location.hash = `#/rooms/${roomId}`
  }
</script>

{#if $url.hash.indexOf("#/rooms/") === 0 || $url.hash === "#/"}
  <Room roomId={$url.hash.split(["#/rooms/"])[1]} />
{:else}
  <main
    class="flex flex-col gap-4 container max-w-xl mx-auto items-center p-12"
  >
    <h1 class="text-3xl">That Paper Game</h1>

    <div>
      <input type="text" class="input input-bordered" bind:value={roomId} />
      <button class="btn" on:click={joinRoom}>Join</button>
    </div>
    <button class="btn" on:click={createNewRoom}>Create New room</button>
  </main>
{/if}
