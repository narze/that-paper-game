<script lang="ts">
  import type { svelteSyncedStore } from "@syncedstore/svelte"

  import { onMount, onDestroy } from "svelte"
  import type { GamePlayer, svelteStore } from "./lib/synced-store"
  import { player } from "./lib/player-store"

  export let store: typeof svelteStore
  export let nextState: () => void
  let currentPlayerBeforeMove: GamePlayer

  const playerId = $player.id
  $: players = $store.players
  $: currentPlayerIdx = $store.gameData.currentPlayerIdx || 0
  $: maxDistance = $store.gameData.maxDistance || 0
  $: distance = $store.gameData.distance || 0
  $: rolled = $store.gameData.rolled || false
  $: currentPlayerBeforeMove = $store.gameData.currentPlayerBeforeMove || {}
  $: gameEnded = $store.gameData.gameEnded || false
  $: isMyTurn = players[currentPlayerIdx].id === playerId
  $: currentPlayer = players[currentPlayerIdx]

  const directions = {
    up: "🔼",
    right: "▶️",
    down: "🔽",
    left: "◀️",
  }

  let map: boolean[][] = Array(8)
    .fill(false)
    .map(() => Array(5).fill(false))
    .map((a) => [true, ...a, true])

  map[0] = map[0].map((_cell) => true)
  map[map.length - 1] = map[map.length - 1].map((_cell) => true)

  $: if (players.filter((p) => p.hp > 0).length === 1) {
    const winner = players.filter((p) => p.hp > 0)[0]
    // alert(`${winner.name} won!`)
    gameEnded = true
  }

  // $: if (currentPlayerIdx < 0) {
  //   $store.gameData.currentPlayerIdx = 0
  // }

  // $: if (currentPlayerIdx > players.length - 1) {
  //   $store.gameData.currentPlayerIdx = players.length - 1
  // }

  $: mapWithPlayers = map.map((row, y) =>
    row.map((hole, x) => ({
      x,
      y,
      hole,
      player: players.find(
        (player) => player.x === x && player.y === y && player.hp > 0
      ),
    }))
  )

  $: isDead = currentPlayer && currentPlayer.hp <= 0
  $: if (isDead) {
    endTurn()
  }

  $: attackable = isMyTurn && rolled && distance == maxDistance
  $: canWalk = {
    up: isMyTurn && rolled && walkable(currentPlayer.x, currentPlayer.y - 1),
    down: isMyTurn && rolled && walkable(currentPlayer.x, currentPlayer.y + 1),
    left: isMyTurn && rolled && walkable(currentPlayer.x - 1, currentPlayer.y),
    right: isMyTurn && rolled && walkable(currentPlayer.x + 1, currentPlayer.y),
  }

  function onUp() {
    const player = players[currentPlayerIdx]
    if (!walkable(player.x, player.y - 1)) {
      return
    }
    $store.players[currentPlayerIdx].direction = "up"
    $store.players[currentPlayerIdx].y = player.y - 1
    $store.gameData.distance = distance + 1
    // $store.players[currentPlayerIdx] = player
  }

  function onLeft() {
    const player = players[currentPlayerIdx]
    if (!walkable(player.x - 1, player.y)) {
      return
    }
    $store.players[currentPlayerIdx].direction = "left"
    $store.players[currentPlayerIdx].x = player.x - 1
    $store.gameData.distance = distance + 1
    // $store.players[currentPlayerIdx] = player
  }

  function onRight() {
    const player = players[currentPlayerIdx]
    if (!walkable(player.x + 1, player.y)) {
      return
    }
    $store.players[currentPlayerIdx].direction = "right"
    $store.players[currentPlayerIdx].x = player.x + 1
    $store.gameData.distance = distance + 1
    // $store.players[currentPlayerIdx] = player
  }

  function onDown() {
    const player = players[currentPlayerIdx]
    if (!walkable(player.x, player.y + 1)) {
      return
    }
    $store.players[currentPlayerIdx].direction = "down"
    $store.players[currentPlayerIdx].y = player.y + 1
    $store.gameData.distance = distance + 1
    // $store.players[currentPlayerIdx] = player
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
          players[targetIdx].hp -= 1
          players[targetIdx].y -= 1
          checkPlayerInHole(targetIdx)
          // players = players
        }
        break
      case "right":
        targetIdx = players.findIndex(
          (p) => p.x === player.x + 1 && p.y === player.y
        )
        if (targetIdx != -1) {
          players[targetIdx].hp -= 1
          players[targetIdx].x += 1
          checkPlayerInHole(targetIdx)
          // players = players
        }
        break
      case "down":
        targetIdx = players.findIndex(
          (p) => p.x === player.x && p.y === player.y + 1
        )
        if (targetIdx != -1) {
          players[targetIdx].hp -= 1
          players[targetIdx].y += 1
          checkPlayerInHole(targetIdx)
          // players = players
        }
        break
      case "left":
        targetIdx = players.findIndex(
          (p) => p.x === player.x - 1 && p.y === player.y
        )
        if (targetIdx != -1) {
          players[targetIdx].hp -= 1
          players[targetIdx].x -= 1
          checkPlayerInHole(targetIdx)
          // players = players
        }
        break
    }

    endTurn()
  }

  function checkPlayerInHole(playerIdx) {
    const player = players[playerIdx]

    if (map[player.y]?.[player.x] == true) {
      players[playerIdx].hp = 0
    }
  }

  function walkable(x, y) {
    if (distance >= maxDistance) return false
    if (mapWithPlayers[y]?.[x].hole) return false
    if (mapWithPlayers[y]?.[x].player) return false

    return true
  }

  function rollDice() {
    $store.gameData.currentPlayerBeforeMove = { ...currentPlayer }
    $store.gameData.maxDistance = ~~(Math.random() * 6) + 1
    $store.gameData.rolled = true
  }

  function resetWalk() {
    $store.players[currentPlayerIdx].x = currentPlayerBeforeMove.x
    $store.players[currentPlayerIdx].y = currentPlayerBeforeMove.y
    $store.players[currentPlayerIdx].direction =
      currentPlayerBeforeMove.direction
    $store.gameData.distance = 0
  }

  function endTurn() {
    $store.gameData.currentPlayerIdx = (currentPlayerIdx + 1) % players.length
    $store.gameData.rolled = false
    $store.gameData.distance = 0
    $store.gameData.maxDistance = 0
  }

  function restartGame() {
    currentPlayerIdx = 0
    rolled = false
    distance = 0
    maxDistance = 0
    players = players.map((p) => ({ ...p, hp: 5 }))
    gameEnded = false
  }

  function nextPlayer() {
    if (currentPlayerIdx === players.length - 1) {
      $store.players.forEach((p) => (p.hp = 5))
      nextState()
    } else {
      $store.gameData.currentPlayerIdx = currentPlayerIdx + 1
    }
  }
</script>

<div class="prepare">
  <h2 class="text-xl">Prepare</h2>

  <div class="players">
    <h2 class="text-lg">Players</h2>

    <div class="flex flex-col w-32 justify-center mx-auto">
      {#each players as player, idx}
        <div class={`${idx === currentPlayerIdx ? "bg-green-400" : ""}`}>
          #{idx + 1}: {player.name}
        </div>
      {/each}
    </div>
  </div>

  <!-- {JSON.stringify(currentPlayerBeforeMove)} -->
  <div class="board flex flex-col items-center mt-16">
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

  {#if isMyTurn}
    <div class="text-lg mt-8 bg-green-300 inline-block">It's Your Turn!</div>
  {/if}

  <div class="controls flex justify-center mt-12">
    <div class="players">
      {#each players as player, idx}
        <div
          class={`px-3 py-1 mt-1 text-left ${player.color} ${
            player.hp <= 0 ? "line-through" : ""
          }`}
        >
          {player.name}
          {player.hp}
          {currentPlayerIdx == idx ? "*" : ""}
        </div>
      {/each}
    </div>

    <div class="flex flex-col ml-12">
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
      <button on:click={rollDice} disabled={!isMyTurn || rolled} class="btn"
        >Roll</button
      >
      <button on:click={resetWalk} disabled={!isMyTurn || !rolled} class="btn"
        >Reset</button
      >

      {#if rolled}
        <div class="mt-4 text-xl">{distance}/{maxDistance ?? ""}</div>
      {/if}
    </div>
  </div>

  {#if gameEnded}
    <div class="flex justify-center mt-8">
      <button class="btn" on:click={restartGame}>Restart</button>
    </div>
  {/if}
</div>
