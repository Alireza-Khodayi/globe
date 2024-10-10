<script lang="ts">
	import { suffixFormat } from '$lib/utils/suffix-format';
	import { fade } from 'svelte/transition';

	export let data;
</script>

{#if data?.country}
	<div transition:fade class="absolute bottom-8 right-0 text-right">
		<h3 class="text-white text-2xl font-bold mb-1">{data.country}</h3>
		<h5 class="text-zinc-400 text-lg font-light">
			Population of {suffixFormat(data.population)}
		</h5>
	</div>
{/if}
