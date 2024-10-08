<script>
	// @ts-nocheck

	import * as topojson from 'topojson-client';
	import { geoOrthographic, geoPath } from 'd3-geo';
	import { scaleLinear } from 'd3-scale';
	import { max } from 'd3-array';

	import world from '$lib/data/world-110m.json';
	import data from '$lib/data/countries-papulation.json';

	import Glow from './Glow.svelte';

	let countries = topojson.feature(world, world.objects.countries).features;
	let borders = topojson.mesh(world, world.objects.countries, (a, b) => a !== b);

	let width = 400;
	$: height = width;

	$: projection = geoOrthographic()
		.scale(width / 2)
		.rotate([0, 0, 0])
		.translate([width / 2, height / 2]);

	$: path = geoPath(projection);

	const colorScale = scaleLinear()
		.domain([0, max(data, (d) => d.population)]) //Input
		.range(['#26362e', '#0dcc6c']); //Output
</script>

<div class="chart-container max-w-md mx-auto mt-20" bind:clientWidth={width}>
	<svg {width} {height} class="overflow-visible">
		<!-- Glow -->
		<Glow />
		<!-- Globe -->
		<circle cx={width / 2} cy={height / 2} r={width / 2} fill="#1c1c1c" filter="url(#glow)" />
		{#each countries as country}
			<path d={path(country)} fill="#26362e" stroke="none" />
		{/each}
		<path d={path(borders)} fill="none" stroke="black" />
	</svg>
</div>
