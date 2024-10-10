<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import { spring } from 'svelte/motion';
	import { draw } from 'svelte/transition';

	import * as topojson from 'topojson-client';
	import { geoOrthographic, geoPath, geoCentroid } from 'd3-geo';
	import { scaleLinear } from 'd3-scale';
	import { max } from 'd3-array';
	import { timer } from 'd3-timer';
	import { drag } from 'd3-drag';
	import { select } from 'd3-selection';
	import { zoom } from 'd3-zoom';

	import world from '$lib/data/world-110m.json';
	import data from '$lib/data/countries-papulation.json';

	import Glow from './Glow.svelte';
	import Tooltip from './Tooltip.svelte';
	import Legend from './Legend.svelte';

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
		if (dragging || tooltipData) return;
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
		// .call(
		// 	zoom().on('zoom', (event) => {
		// 		if (event.transform.k > 0.3) {
		// 			projection.scale((width / 2) * event.transform.k);
		// 			path = geoPath().projection(projection);
		// 			globe.selectAll('path').attr('d', path);
		// 			globe.attr('r', projection.scale());
		// 		} else {
		// 			event.transform.k = 0.3;
		// 		}
		// 	})
		// );
	});

	let tooltipData;

	$: if (tooltipData) {
		const center = geoCentroid(tooltipData);
		$xRotation = -center[0];
		$yRotation = -center[1];
	}
</script>

<div class="max-w-md mx-auto cursor-grab active:cursor-grabbing" bind:clientWidth={width}>
	<h1 class="text-white text-center text-2xl font-extrabold mb-2">The world at a Glance</h1>
	<h2 class="text-zinc-400 text-center text-lg font-extralight mb-4">
		Population by Country, 2021
	</h2>
	<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<svg {width} {height} class="overflow-visible" bind:this={globe}>
		<!-- Glow -->
		<Glow />
		<!-- Globe -->
		<circle
			cx={width / 2}
			cy={height / 2}
			r={width / 2}
			fill="#1c1c1c"
			filter="url(#glow)"
			on:click={() => {
				tooltipData = null;
			}}
			on:focus={() => {
				tooltipData = null;
			}}
			tabindex="0"
		/>
		<!-- Countries -->
		{#each countries as country}
			<path
				class="hover:cursor-pointer"
				d={path(country)}
				fill={colorScale(country?.population || 0)}
				stroke={'none'}
				on:click={() => {
					tooltipData = country;
				}}
				on:focus={() => {
					tooltipData = country;
				}}
				tabindex="0"
			/>
		{/each}
		<!-- Borders -->
		<path d={path(borders)} fill="none" stroke="black" />

		<!-- Selected country border -->
		{#if tooltipData}
			{#key tooltipData.id}
				<path
					d={path(tooltipData)}
					fill="transparent"
					stroke="white"
					stroke-width="2"
					in:draw={{ duration: 1500 }}
				/>
			{/key}
		{/if}
	</svg>
	<Tooltip data={tooltipData} />
	<Legend {colorScale} data={tooltipData} />
</div>

<style>
	circle:focus,
	path:focus {
		outline: none;
	}
</style>
