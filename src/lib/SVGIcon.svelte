<script>
  export let name
  export let width = "1.5rem"
  export let height = "1.5rem"
  export let focusable = "false"
</script>

<svg class={$$props.class} {focusable} {width} {height}>
  <image xlink:href={`/${name}.svg`} {width} {height} />
</svg>
