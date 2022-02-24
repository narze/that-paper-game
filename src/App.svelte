<script lang="ts">
  const directions = {
    up: "🔼",
    right: "▶️",
    down: "🔽",
    left: "◀️",
  }

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
  let maxDistance = 0
  let distance = 0
  let rolled = false

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

  $: attackable = rolled && distance == maxDistance
  $: canWalk = {
    up: rolled && walkable(currentPlayer.x, currentPlayer.y - 1),
    down: rolled && walkable(currentPlayer.x, currentPlayer.y + 1),
    left: rolled && walkable(currentPlayer.x - 1, currentPlayer.y),
    right: rolled && walkable(currentPlayer.x + 1, currentPlayer.y),
  }

  function onUp() {
    const player = players[currentPlayerIdx]
    if (!walkable(player.x, player.y - 1)) {
      return
    }
    player.direction = "up"
    player.y = player.y - 1
    distance += 1
    players = players
  }

  function onLeft() {
    const player = players[currentPlayerIdx]
    if (!walkable(player.x - 1, player.y)) {
      return
    }
    player.direction = "left"
    player.x = player.x - 1
    distance += 1
    players = players
  }

  function onRight() {
    const player = players[currentPlayerIdx]
    if (!walkable(player.x + 1, player.y)) {
      return
    }
    player.direction = "right"
    player.x = player.x + 1
    distance += 1
    players = players
  }

  function onDown() {
    const player = players[currentPlayerIdx]
    if (!walkable(player.x, player.y + 1)) {
      return
    }
    player.direction = "down"
    player.y = player.y + 1
    distance += 1
    players = players
  }

  function onAtk() {
    if (!attackable) {
      return
    }

    const player = players[currentPlayerIdx]
    let targetIdx

    switch (player.direction) {
      case "up":
        targetIdx = players.findIndex(
          (p) => p.x === player.x && p.y === player.y - 1
        )
        if (targetIdx != -1) {
          //TODO: Reduce hp
          players[targetIdx].y -= 1
          players = players
        }
        break
      case "right":
        targetIdx = players.findIndex(
          (p) => p.x === player.x + 1 && p.y === player.y
        )
        if (targetIdx != -1) {
          //TODO: Reduce hp
          players[targetIdx].x += 1
          players = players
        }
        break
      case "down":
        targetIdx = players.findIndex(
          (p) => p.x === player.x && p.y === player.y + 1
        )
        if (targetIdx != -1) {
          //TODO: Reduce hp
          players[targetIdx].y += 1
          players = players
        }
        break
      case "left":
        targetIdx = players.findIndex(
          (p) => p.x === player.x - 1 && p.y === player.y
        )
        if (targetIdx != -1) {
          //TODO: Reduce hp
          players[targetIdx].x -= 1
          players = players
        }
        break
    }
  }

  function walkable(x, y) {
    if (distance >= maxDistance) return false
    if (mapWithPlayers[y]?.[x].hole) return false
    if (mapWithPlayers[y]?.[x].player) return false

    return true
  }

  function rollDice() {
    maxDistance = ~~(Math.random() * 6) + 1
    rolled = true
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
              <div
                class={`w-full h-full ${player.color} flex items-center justify-center text-3xl`}
              >
                {directions[player.direction]}
              </div>
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
          disabled={!canWalk["up"]}
          class={`btn w-16 h-16 border rounded flex items-center justify-center`}
          >Up</button
        >
        <span class="w-16 h-16" />
      </div>
      <div class="flex">
        <button
          on:click={onLeft}
          disabled={!canWalk["left"]}
          class={`btn w-16 h-16 border rounded flex items-center justify-center`}
          >Left</button
        >
        <button
          on:click={onAtk}
          disabled={!attackable}
          class={`btn w-16 h-16 border rounded flex items-center justify-center ${
            !attackable ? "btn-disabled" : ""
          }`}>Atk</button
        >
        <button
          on:click={onRight}
          disabled={!canWalk["right"]}
          class={`btn w-16 h-16 border rounded flex items-center justify-center`}
          >Right</button
        >
      </div>
      <div class="flex">
        <span class="w-16 h-16" />
        <button
          on:click={onDown}
          disabled={!canWalk["down"]}
          class={`btn w-16 h-16 border rounded flex items-center justify-center`}
          >Down</button
        >
        <span class="w-16 h-16" />
      </div>
    </div>

    <div class="ml-8 flex flex-col">
      <button on:click={rollDice} disabled={rolled} class="btn">Roll</button>

      {#if maxDistance != undefined}
        <div class="mt-4 text-xl">{distance}/{maxDistance ?? ""}</div>
      {/if}
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
