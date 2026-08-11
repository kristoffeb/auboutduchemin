<script lang="ts">
	const aboutStatements = [
		"Kris sent qu’il vibre trop souvent pour trop de choses.",
		'Kris se sent seul, même au sein de ceux qui l’entourent.',
		'Kris vénère Joy Division et Arcade Fire dont les albums sont bénis.',
		'Kris ne rêve pas, il patiente.',
		'Kris joue de la guitare, et chante aussi.',
		'Kris adore jouer des chansons de Belle & Sebastian et d’Elliott Smith.',
		'Kris écrit en imaginant être quelqu’un de meilleur.',
		'Kris fuit constamment.',
		'Kris a écrit une dizaine de chapitres d’ouvertures de nouvelles avortés.',
		'Kris oublie tout, sauf les choses qui comptent.',
		'Kris écoutait du rap bien avant d’écouter de l’indie-rock.',
		'Kris adore l’ambiance disparate des concerts.',
		'Kris préfère Oasis à Blur.',
		'Kris aimerait pouvoir rapper comme Eminem.',
		'Kris aimerait aimer tout le monde, mais il ne s’aime déjà pas lui-même.',
		'Kris a vu Before Sunset à l’en connaître par coeur.',
		'Kris ne comprend rien au rugby.',
		'Kris n’est encore prêt pour se plonger dans le jazz.',
		'Kris a un autographe de Filip, Adel et Frank.',
		'Kris a créé Au Bout Du Chemin en pensant qu’il l’abandonnerait rapidement.',
		'Kris écrit vite, mais réfléchit très longtemps.',
		'Kris aimerait connaître tellement mieux la musique africaine.',
		'Kris ne sait pas danser.',
		'Kris a souvent envie de crier sans raison.',
		'Kris nourrit une fascination pour le mouvement punk.',
		'Kris ne peut gribouiller que seul.',
		'Kris pleure facilement, mais on ne dirait pas comme ça.',
		'Kris fait avec, mais parfois il voudrait vraiment faire, tout simplement.',
		'Kris prend des photos de temps à autre ; beaucoup de mauvaises et quelques biens.',
		'Kris pense qu’il pourrait être Maître du Monde s’il n’avait pas autant la flemme.',
		'Kris aimerait croire en Dieu.',
		'Kris aime par-dessus tout la musique quelle qu’elle soit.',
		'Kris vit d’amour et d’eau fraîche (enfin il aimerait bien).',
		'Kris est un rêveur invétéré mais dont les pieds ne veulent pas décoller.',
		'Kris aime la bestialité crasseuse des Kills.',
		'Kris a appris à ne pas se dévoiler.',
		'Kris est né deux ans après la victoire de Noah à Rolland-Garros.',
		'Kris est amoureux de Mia Clarke d’Electrelane, de Lily Allen.',
		'Kris épousera un jour Zooey Deschanel.',
		'Kris est parti, et il ne sait pas quand il pourra revenir.'
	];
</script>

<svelte:head>
	<title>About — Au Bout Du Chemin</title>
	<meta
		name="description"
		content="A propos de Kris et du blog Au Bout Du Chemin, entre musique, ecriture et fragments de vie."
	/>
</svelte:head>

<main class="postPage staticPage">
	<h1 class="postTitle">À propos</h1>

	<section class="contentBody aboutContent" aria-label="A propos">
		<p>
			<em
				>Un jour, une chanson. Une évasion de quelques minutes. Parce que parfois, j’ai juste
				envie de partager, de faire défiler ce qui passe entre mes deux oreilles. Ecrire pour
				délivrer. Ecrire par rédemption. Entre passion et fascination, un idéal. Au bout du
				chemin, la liberté.</em
			>
		</p>

		<p>
			Kris aime la musique, le cinéma, la littérature, les gens sympas, les gens brisés, les
			gens perdus, les gens qui m’aiment, les gens qui me détestent, ne pas dormir la nuit,
			fouiller les bacs à disques, Paris, les parties de PES, les Kinder Bueno, l’intemporalité
			des concerts, les séries US, les films crève-coeurs, les discussions absurdes, les
			descriptions absurdes. La vie. Absurde.
		</p>

		<div class="aboutStatements" aria-label="Portrait de Kris">
			{#each aboutStatements as statement}
				<p>{statement}</p>
			{/each}
		</div>

		<p>
			Kris a écrit pour
			<a href="https://www.soundofviolence.net/">Sound Of Violence</a>,
			<a href="https://www.danslemurduson.com/">Dans Le Mur Du Son</a>,
			<a href="https://web.archive.org/web/20101229223841/http://inside-rock.fr/_Kris_"
				>Inside Rock</a
			>
			et
			<a
				href="https://web.archive.org/web/20101229223841/http://musique.fluctuat.net/blog/contributeurs/kris.html"
				>Fluctuat</a
			>.
		</p>

		<p>
			Kris a répondu aux
			<a
				href="https://web.archive.org/web/20101229223841/http://www.evene.fr/celebre/actualite/au-bout-du-chemin-blog-musique-2302.php"
				>questions d’Evène</a
			>.
		</p>

		<p class="aboutFinePrint">
			Les mp3 proposés sont mis temporairement à disposition des internautes qui se seraient
			aventurés sur ce blog. Le but premier étant bien évidemment de promouvoir la musique et les
			artistes présentés, en faisant découvrir des fragments musicaux des oeuvres de ces
			musiciens. Si toutefois, en tant que détenteur des droits, vous souhaiteriez voir l'un des
			mp3 retiré et supprimé,
			<a href="https://web.archive.org/web/20101229223841/http://www.auboutduchemin.net/contact/"
				>contactez-moi</a
			>, et cela sera effectué immédiatement.
		</p>
	</section>
</main>

<style>
	.staticPage {
		padding-bottom: 120px;
	}

	.aboutStatements {
		margin: 2.2rem 0;
	}

	.aboutStatements p {
		margin: 0 0 0.58rem;
	}

	.aboutContent a {
		text-decoration: underline;
		text-decoration-color: var(--linkUnderline);
		text-underline-offset: 0.18em;
	}

	.aboutContent p:first-of-type::first-letter {
		float: none;
		font-size: inherit;
		line-height: inherit;
		margin: 0;
		font-weight: inherit;
		color: inherit;
	}

	.aboutFinePrint {
		font-size: 0.92em;
	}

	@media (max-width: 860px) {
		.staticPage {
			padding-bottom: 142px;
		}

		.aboutStatements {
			margin: 1.8rem 0;
		}
	}
</style>
