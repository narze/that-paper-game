<script lang="ts">
  import { nanoid } from "nanoid"

  import Room from "./Room.svelte"
  import url from "./lib/url"

  $: roomFragment = $url.hash.split(["#/rooms/"])[1]
  $: roomId = roomFragment?.split("/")[0]
  $: createRoom = roomFragment?.split("/")[1] == "create"

  function createNewRoom() {
    const newRoomId = nanoid()
    window.location.hash = `#/rooms/${newRoomId}/create`
  }

  function joinRoom() {
    window.location.hash = `#/rooms/${roomId}`
  }
</script>

{#if $url.hash.indexOf("#/rooms/") === 0 || $url.hash === "#/"}
  <Room {roomId} {createRoom} />
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
