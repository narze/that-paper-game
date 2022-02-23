<script lang="ts">
  let map: boolean[][] = Array(10)
    .fill(false)
    .map(() => Array(7).fill(false))
    .map((a) => [true, ...a, true])

  map[0] = map[0].map((_cell) => true)
  map[map.length - 1] = map[map.length - 1].map((_cell) => true)

  let players = [
    { x: 1, y: 2, direction: "right", color: "bg-lime-500" },
    { x: 5, y: 3, direction: "left", color: "bg-red-500" },
    { x: 4, y: 8, direction: "left", color: "bg-blue-500" },
  ]

  let currentPlayerIdx = 1

  $: if (currentPlayerIdx < 0) {
    currentPlayerIdx = 0
  }

  $: if (currentPlayerIdx > players.length - 1) {
    currentPlayerIdx = players.length - 1
  }

  $: currentPlayer = players[currentPlayerIdx]

  $: mapWithPlayers = map.map((row, y) =>
    row.map((hole, x) => ({
      x,
      y,
      hole,
      player: players.find((player) => player.x === x && player.y === y),
    }))
  )

  function onUp() {
    const player = players[currentPlayerIdx]
    if (!walkable(player.x, player.y - 1)) {
      return
    }
    player.direction = "up"
    player.y = player.y - 1
    players = players
  }

  function onLeft() {
    const player = players[currentPlayerIdx]
    if (!walkable(player.x - 1, player.y)) {
      return
    }
    player.direction = "left"
    player.x = player.x - 1
    players = players
  }

  function onAtk() {
    const player = players[currentPlayerIdx]
  }

  function onRight() {
    const player = players[currentPlayerIdx]
    if (!walkable(player.x + 1, player.y)) {
      return
    }
    player.direction = "right"
    player.x = player.x + 1
    players = players
  }

  function onDown() {
    const player = players[currentPlayerIdx]
    if (!walkable(player.x, player.y + 1)) {
      return
    }
    player.direction = "down"
    player.y = player.y + 1
    players = players
  }

  function walkable(x, y) {
    if (mapWithPlayers[y]?.[x].hole) return false
    if (mapWithPlayers[y]?.[x].player) return false

    return true
  }
</script>

<main>
  <h1>That Paper Game</h1>

  <div class="board flex flex-col items-center">
    {#each mapWithPlayers as row, rowIdx}
      <div class="flex">
        {#each row as { x, y, hole, player }, cellIdx}
          <span
            class={`h-12 w-12 border border-black ${hole ? "bg-gray-900" : ""}`}
          >
            {#if player}
              <div class={`w-full h-full ${player.color}`} />
            {/if}
          </span>
        {/each}
      </div>
    {/each}
  </div>

  <div class="controls flex justify-center mt-12">
    <div class="flex flex-col">
      <div class="flex">
        <span class="w-16 h-16" />
        <button
          on:click={onUp}
          disabled={!walkable(currentPlayer.x, currentPlayer.y - 1)}
          class={`w-16 h-16 border rounded flex items-center justify-center ${
            walkable(currentPlayer.x, currentPlayer.y - 1) ? "" : "bg-gray-500"
          }`}>Up</button
        >
        <span class="w-16 h-16" />
      </div>
      <div class="flex">
        <button
          on:click={onLeft}
          disabled={!walkable(currentPlayer.x - 1, currentPlayer.y)}
          class={`w-16 h-16 border rounded flex items-center justify-center ${
            walkable(currentPlayer.x - 1, currentPlayer.y) ? "" : "bg-gray-500"
          }`}>Left</button
        >
        <button
          on:click={onAtk}
          class="w-16 h-16 border rounded flex items-center justify-center"
          >Atk</button
        >
        <button
          on:click={onRight}
          disabled={!walkable(currentPlayer.x + 1, currentPlayer.y)}
          class={`w-16 h-16 border rounded flex items-center justify-center ${
            walkable(currentPlayer.x + 1, currentPlayer.y) ? "" : "bg-gray-500"
          }`}>Right</button
        >
      </div>
      <div class="flex">
        <span class="w-16 h-16" />
        <button
          on:click={onDown}
          disabled={!walkable(currentPlayer.x, currentPlayer.y + 1)}
          class={`w-16 h-16 border rounded flex items-center justify-center ${
            walkable(currentPlayer.x, currentPlayer.y + 1) ? "" : "bg-gray-500"
          }`}>Down</button
        >
        <span class="w-16 h-16" />
      </div>
    </div>
  </div>

  <div class="players flex justify-center mt-8">
    <input type="number" bind:value={currentPlayerIdx} />
  </div>
</main>

<style>
  :root {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }

  main {
    text-align: center;
    padding: 1em;
    margin: 0 auto;
  }

  img {
    height: 16rem;
    width: 16rem;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4rem;
    line-height: 1.1;
    margin: 2rem auto;
    max-width: 14rem;
  }

  p {
    max-width: 14rem;
    margin: 1rem auto;
    line-height: 1.35;
  }

  @media (min-width: 480px) {
    h1 {
      max-width: none;
    }

    p {
      max-width: none;
    }
  }
</style>
