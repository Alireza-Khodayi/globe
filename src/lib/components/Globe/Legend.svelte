<script>
	import { suffixFormat } from '$lib/utils/suffix-format';

	export let colorScale;
	export let data;

	const minColor = colorScale.range()[0];
	const maxColor = colorScale.range()[1];

	const minValue = colorScale.domain()[0];
	const maxValue = colorScale.domain()[1];

	$: percentOfMax = (data?.population / maxValue) * 100;
</script>

<div class="flex gap-2">
	<span class="text-zinc-300 text-sm select-none">{minValue}</span>
	<div
		class="h-4 w-full relative"
		style:background="linear-gradient(to right,{minColor} 0%,{maxColor} 100%)"
	>
		{#if percentOfMax}
			<span class="line absolute top-0 h-4 w-0.5 bg-white" style:left={percentOfMax + '%'} />
		{/if}
	</div>

	<span class="text-zinc-300 text-sm select-none">{suffixFormat(maxValue)}</span>
</div>

<style>
	.line {
		transition: left 500ms cubic-bezier(1, 0, 0, 1);
	}
</style>
