<script>
	import { browser } from '$app/environment';
	import Globe from '$lib/components/Globe/Globe.svelte';
</script>

{#if browser}
	<Globe />
{/if}
