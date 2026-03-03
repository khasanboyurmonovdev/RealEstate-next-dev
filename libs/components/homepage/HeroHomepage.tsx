// Phase 4 Task 3
import React, { useCallback, useState } from 'react';
import { Stack, Box } from '@mui/material';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PlaceIcon from '@mui/icons-material/Place';
import { PropertiesInquiry } from '../../types/property/property.input';
import './hero.scss';

const initialInput: PropertiesInquiry = {
	page: 1,
	limit: 9,
	search: {
		squaresRange: { start: 0, end: 500 },
		pricesRange: { start: 0, end: 2000000 },
	},
};

const HeroHomepage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const [searchFilter, setSearchFilter] = useState<PropertiesInquiry>(initialInput);
	const [searchMode, setSearchMode] = useState<'rent' | 'sale'>('rent');
	const [locationInput, setLocationInput] = useState('');

	const pushSearchHandler = useCallback(async () => {
		try {
			const filter = {
				...searchFilter,
				search: {
					...searchFilter.search,
					text: locationInput?.trim() || undefined,
					options: searchMode === 'rent' ? ['propertyRent'] : undefined,
				},
			};
			if (!filter.search.text) delete filter.search.text;
			if (!filter.search.options) delete filter.search.options;
			await router.push(
				`/property?input=${encodeURIComponent(JSON.stringify(filter))}`,
				`/property?input=${encodeURIComponent(JSON.stringify(filter))}`,
			);
		} catch (err) {
			console.error('pushSearchHandler', err);
		}
	}, [searchFilter, locationInput, searchMode, router]);

	return (
		<section className="hero-homepage">
			<div className="hero-blob hero-blob-1" />
			<div className="hero-blob hero-blob-2" />
			<div className="hero-container">
				<div className="hero-grid">
					<div className="hero-left">
						<div className="hero-eyebrow">🇺🇿 {t('Hero eyebrow')}</div>
						<h1 className="hero-headline">
							<span className="hero-headline-line">{t('Hero headline 1')}</span>
							<span className="hero-headline-line hero-headline-accent">{t('Hero headline 2')}</span>
							<span className="hero-headline-line">{t('Hero headline 3')}</span>
						</h1>
						<p className="hero-subheadline">{t('Hero subheadline')}</p>
						<div className="hero-search-bar">
							<div className="hero-search-tabs">
								<button
									type="button"
									className={`hero-tab ${searchMode === 'rent' ? 'active' : ''}`}
									onClick={() => setSearchMode('rent')}
								>
									{t('Hero tab rent')}
								</button>
								<span className="hero-tab-divider" />
								<button
									type="button"
									className={`hero-tab ${searchMode === 'sale' ? 'active' : ''}`}
									onClick={() => setSearchMode('sale')}
								>
									{t('Hero tab sale')}
								</button>
							</div>
							<span className="hero-search-divider" />
							<div className="hero-location-input-wrap">
								<PlaceIcon className="hero-location-icon" />
								<input
									type="text"
									className="hero-location-input"
									placeholder={t('Hero location placeholder')}
									value={locationInput}
									onChange={(e) => setLocationInput(e.target.value)}
									onKeyDown={(e) => e.key === 'Enter' && pushSearchHandler()}
								/>
							</div>
							<button type="button" className="hero-search-btn" onClick={pushSearchHandler}>
								<SearchRoundedIcon />
								{t('Hero search button')}
							</button>
						</div>
						<div className="hero-stats">
							<div className="hero-stat">
								<span className="hero-stat-value">12,000+</span>
								<span className="hero-stat-label">{t('Hero stat 1 label')}</span>
							</div>
							<span className="hero-stat-divider" />
							<div className="hero-stat">
								<span className="hero-stat-value">4,800+</span>
								<span className="hero-stat-label">{t('Hero stat 2 label')}</span>
							</div>
							<span className="hero-stat-divider" />
							<div className="hero-stat">
								<span className="hero-stat-value">98%</span>
								<span className="hero-stat-label">{t('Hero stat 3 label')}</span>
							</div>
						</div>
					</div>
					<div className="hero-right">
						<div className="hero-visual">
							<div className="hero-visual-gradient" />
							<div className="hero-badge hero-badge-today">🔥 {t('Hero badge today')}</div>
							<div className="hero-property-card">
								<span className="hero-card-badge">{t('Hero card recommended')}</span>
								<span className="hero-card-title">{t('Hero card title')}</span>
								<span className="hero-card-price">4 500 000 so&apos;m/oy</span>
								<div className="hero-card-rating">
									<span className="hero-stars">★★★★★</span>
									<span className="hero-rating-text">4.9</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default HeroHomepage;
