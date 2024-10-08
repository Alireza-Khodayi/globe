<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import { spring } from 'svelte/motion';

	import * as topojson from 'topojson-client';
	import { geoOrthographic, geoPath } from 'd3-geo';
	import { scaleLinear } from 'd3-scale';
	import { max } from 'd3-array';
	import { timer } from 'd3-timer';
	import { drag } from 'd3-drag';
	import { select } from 'd3-selection';

	import world from '$lib/data/world-110m.json';
	import data from '$lib/data/countries-papulation.json';

	import Glow from './Glow.svelte';

	let countries = topojson.feature(world, world.objects.countries).features;
	let borders = topojson.mesh(world, world.objects.countries, (a, b) => a !== b);

	let width = 400;
	$: height = width;

	$: projection = geoOrthographic()
		.scale(width / 2)
		.rotate([$xRotation, $yRotation, 0])
		.translate([width / 2, height / 2]);

	$: path = geoPath(projection);

	const colorScale = scaleLinear()
		.domain([0, max(data, (d) => d.population)]) //Input
		.range(['#26362e', '#0dcc6c']); //Output

	//Restructure countries array to include population from data
	countries.forEach((country) => {
		const metadata = data?.find((d) => d.id === country.id);
		if (metadata) {
			country.population = metadata.population;
			country.country = metadata.country;
		}
	});

	let xRotation = spring(0, { stiffness: 0.08, damping: 0.4 });
	let yRotation = spring(0, { stiffness: 0.1, damping: 0.7 });

	let degreesPerFrame = 0.8;

	const t = timer((elapsed) => {
		if (dragging) return;
		$xRotation += degreesPerFrame;
	}, 0);

	let globe;

	const DRAG_SENSITIVITY = 1;
	let dragging = false;

	onMount(() => {
		const element = select(globe);
		element.call(
			drag()
				.on('drag', (event) => {
					$xRotation = $xRotation + event.dx * DRAG_SENSITIVITY;
					$yRotation = $yRotation - event.dy * DRAG_SENSITIVITY;
					dragging = true;
				})
				.on('end', () => {
					dragging = false;
				})
		);
	});
</script>

<div
	class="chart-container max-w-md mx-auto mt-20 cursor-grab active:cursor-grabbing"
	bind:clientWidth={width}
>
	<svg {width} {height} class="overflow-visible" bind:this={globe}>
		<!-- Glow -->
		<Glow />
		<!-- Globe -->
		<circle cx={width / 2} cy={height / 2} r={width / 2} fill="#1c1c1c" filter="url(#glow)" />
		{#each countries as country}
			<path d={path(country)} fill={colorScale(country?.population || 0)} stroke="none" />
		{/each}
		<path d={path(borders)} fill="none" stroke="black" />
	</svg>
</div>
