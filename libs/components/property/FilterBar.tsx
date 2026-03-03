// Phase 4 Task 7 — Filter Bar Redesign
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Slider from '@mui/material/Slider';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import TuneIcon from '@mui/icons-material/Tune';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { PropertyLocation, PropertyType } from '../../enums/property.enum';
import { PropertiesInquiry } from '../../types/property/property.input';
import { Direction } from '../../enums/common.enum';

// ── Constants ────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
	{ id: 'new', label: 'Eng yangi', sort: 'createdAt', direction: Direction.DESC },
	{ id: 'price_asc', label: 'Narx: arzondan qimmatga', sort: 'propertyPrice', direction: Direction.ASC },
	{ id: 'price_desc', label: 'Narx: qimmatdan arzonga', sort: 'propertyPrice', direction: Direction.DESC },
	{ id: 'area', label: "Maydoni bo'yicha", sort: 'propertySquare', direction: Direction.DESC },
	{ id: 'views', label: "Eng ko'p ko'rilgan", sort: 'propertyViews', direction: Direction.DESC },
];

const PROPERTY_TYPES = [
	{ value: PropertyType.APARTMENT, icon: '🏢', label: 'Kvartira' },
	{ value: PropertyType.HOUSE, icon: '🏠', label: 'Uy' },
	{ value: 'NEWBUILD', icon: '🏗', label: 'Yangi bino' },
	{ value: 'COMMERCIAL', icon: '🏪', label: 'Tijorat' },
	{ value: 'OFFICE', icon: '🏨', label: 'Ofis' },
	{ value: PropertyType.VILLA, icon: '🌳', label: 'Dacha' },
];

const TASHKENT_DISTRICTS: PropertyLocation[] = [
	PropertyLocation.CHILONZOR,
	PropertyLocation.YUNUSABAD,
	PropertyLocation.MIRZO_ULUGBEK,
	PropertyLocation.SERGELI,
	PropertyLocation.YAKKASAROY,
	PropertyLocation.SHAYXONTOHUR,
	PropertyLocation.OLMAZOR,
	PropertyLocation.UCHTEPA,
	PropertyLocation.BEKTEMIR,
	PropertyLocation.YASHNOBOD,
];

const OTHER_LOCATIONS: PropertyLocation[] = [
	PropertyLocation.TASHKENT,
	PropertyLocation.SAMARKAND,
	PropertyLocation.BUKHARA,
	PropertyLocation.ANDIJAN,
	PropertyLocation.FERGANA,
	PropertyLocation.NAMANGAN,
];

const CONDITIONS = ["Yangi ta'mir", 'Yaxshi', "O'rta", 'Talab qiladi'];
const AMENITIES = ['Mebel', 'Texnika', 'Internet', 'Konditsioner', 'Lift', 'Xavfsizlik', 'Avtoturargoh', 'Balkon'];
const BUILDING_TYPES = ['Panel', 'Monolitik', "G'isht", 'Xususiy'];

const PRICE_MAX = 10_000_000;
const PRICE_PRESETS = [
	{ label: '500K', value: 500_000 },
	{ label: '1M', value: 1_000_000 },
	{ label: '2M', value: 2_000_000 },
	{ label: '5M', value: 5_000_000 },
	{ label: '10M+', value: PRICE_MAX },
];

type ListingType = 'ijara' | 'sotish' | 'yangi';
type DropdownKey = 'location' | 'price' | 'rooms' | 'sort' | null;

// ── Props ────────────────────────────────────────────────────────────────────

interface FilterBarProps {
	searchFilter: PropertiesInquiry;
	setSearchFilter: (f: PropertiesInquiry) => void;
	initialInput: PropertiesInquiry;
	total: number;
	/** When true: renders the mobile bottom-sheet version of the filters */
	isMobile?: boolean;
	/** Called by mobile sheet "apply" button to close the sheet */
	onClose?: () => void;
	viewMode?: 'grid' | 'list';
	onViewChange?: (mode: 'grid' | 'list') => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(val: number): string {
	if (val >= 1_000_000) return `${val / 1_000_000}M`;
	if (val >= 1_000) return `${val / 1_000}K`;
	return `${val}`;
}

// ── Component ────────────────────────────────────────────────────────────────

const FilterBar: React.FC<FilterBarProps> = ({
	searchFilter,
	setSearchFilter,
	initialInput,
	total,
	isMobile = false,
	onClose,
	viewMode = 'grid',
	onViewChange,
}) => {
	const router = useRouter();

	// Dropdown open state
	const [openDropdown, setOpenDropdown] = useState<DropdownKey>(null);
	const [showAdvancedModal, setShowAdvancedModal] = useState(false);

	// Non-API filter state (UI-only for now; wired to search object where possible)
	const [condition, setCondition] = useState<string | null>(null);
	const [amenities, setAmenities] = useState<string[]>([]);
	const [buildingType, setBuildingType] = useState<string | null>(null);
	const [floorFrom, setFloorFrom] = useState('');
	const [floorTo, setFloorTo] = useState('');
	const [notFirstFloor, setNotFirstFloor] = useState(false);
	const [notLastFloor, setNotLastFloor] = useState(false);

	// Price slider local state to avoid too many URL pushes on drag
	const priceStart = searchFilter?.search?.pricesRange?.start ?? 0;
	const priceEnd = searchFilter?.search?.pricesRange?.end ?? 2_000_000;
	const [localPrice, setLocalPrice] = useState<[number, number]>([priceStart, priceEnd]);

	useEffect(() => {
		setLocalPrice([priceStart, priceEnd]);
	}, [priceStart, priceEnd]);

	// Close dropdowns on outside click
	const barRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (isMobile) return;
		const handler = (e: MouseEvent) => {
			if (barRef.current && !barRef.current.contains(e.target as Node)) {
				setOpenDropdown(null);
			}
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, [isMobile]);

	// ── Derived values ──────────────────────────────────────────────────────

	const getListingType = (): ListingType => {
		if (searchFilter?.search?.options?.includes('propertyRent')) return 'ijara';
		return 'sotish';
	};

	const getSortLabel = () => {
		const opt = SORT_OPTIONS.find(
			(o) => o.sort === searchFilter?.sort && o.direction === searchFilter?.direction,
		);
		return opt ? opt.label : 'Eng yangi';
	};

	const getAdvancedFilterCount = () =>
		(searchFilter?.search?.typeList?.length ?? 0) +
		(condition ? 1 : 0) +
		amenities.length +
		(buildingType ? 1 : 0);

	const locationLabel = () => {
		const list = searchFilter?.search?.locationList;
		if (!list?.length) return 'Joylashuv';
		if (list.length === 1) return list[0];
		return `${list[0]} +${list.length - 1}`;
	};

	const priceLabel = () => {
		const ps = searchFilter?.search?.pricesRange?.start;
		const pe = searchFilter?.search?.pricesRange?.end;
		if ((!ps || ps === 0) && (!pe || pe === 0 || pe === 2_000_000)) return 'Narx';
		return `${formatPrice(ps ?? 0)} – ${formatPrice(pe ?? 2_000_000)} so'm`;
	};

	const roomsLabel = () => {
		const rooms = searchFilter?.search?.roomsList as number[] | undefined;
		if (!rooms?.length) return 'Xonalar';
		return `${[...rooms].sort((a, b) => a - b).join(', ')} xona`;
	};

	// ── Route-push helper ────────────────────────────────────────────────────

	const pushFilter = useCallback(
		async (newSearch: PropertiesInquiry['search']) => {
			const newInput = { ...searchFilter, search: newSearch };
			setSearchFilter(newInput);
			await router.push(
				`/property?input=${JSON.stringify(newInput)}`,
				`/property?input=${JSON.stringify(newInput)}`,
				{ scroll: false },
			);
		},
		[searchFilter, router, setSearchFilter],
	);

	// ── Handlers ─────────────────────────────────────────────────────────────

	const handleListingTypeChange = (type: ListingType) => {
		let options = searchFilter?.search?.options ? [...searchFilter.search.options] : [];
		if (type === 'ijara') {
			if (!options.includes('propertyRent')) options.push('propertyRent');
		} else {
			options = options.filter((o) => o !== 'propertyRent');
		}
		pushFilter({ ...searchFilter.search, options: options.length ? options : undefined });
	};

	const handleLocationToggle = (location: PropertyLocation) => {
		const current = (searchFilter?.search?.locationList ?? []) as PropertyLocation[];
		const isSelected = current.includes(location);
		const newList = isSelected ? current.filter((l) => l !== location) : [...current, location];
		pushFilter({ ...searchFilter.search, locationList: newList.length ? newList : undefined });
	};

	const handleRoomToggle = (room: number) => {
		const current = (searchFilter?.search?.roomsList ?? []) as number[];
		const isSelected = current.includes(room);
		const newList = isSelected ? current.filter((r) => r !== room) : [...current, room];
		pushFilter({ ...searchFilter.search, roomsList: newList.length ? (newList as Number[]) : undefined });
	};

	const handlePriceInputChange = (value: string, type: 'start' | 'end') => {
		const numVal = Number(value) || 0;
		pushFilter({
			...searchFilter.search,
			pricesRange: { ...(searchFilter.search.pricesRange ?? { start: 0, end: 2_000_000 }), [type]: numVal },
		});
	};

	const handleSliderCommit = (_: Event | React.SyntheticEvent, value: number | number[]) => {
		if (!Array.isArray(value)) return;
		const [start, end] = value;
		pushFilter({ ...searchFilter.search, pricesRange: { start, end } });
	};

	const handlePresetPrice = (maxValue: number) => {
		pushFilter({ ...searchFilter.search, pricesRange: { start: 0, end: maxValue } });
	};

	const handleTypeToggle = (type: PropertyType) => {
		const current = (searchFilter?.search?.typeList ?? []) as PropertyType[];
		const isSelected = current.includes(type);
		const newList = isSelected ? current.filter((t) => t !== type) : [...current, type];
		pushFilter({ ...searchFilter.search, typeList: newList.length ? newList : undefined });
	};

	const handleSortChange = async (opt: (typeof SORT_OPTIONS)[0]) => {
		const newFilter = { ...searchFilter, sort: opt.sort, direction: opt.direction };
		setSearchFilter(newFilter);
		setOpenDropdown(null);
		await router.push(
			`/property?input=${JSON.stringify(newFilter)}`,
			`/property?input=${JSON.stringify(newFilter)}`,
			{ scroll: false },
		);
	};

	const handleRefresh = async () => {
		setSearchFilter(initialInput);
		setCondition(null);
		setAmenities([]);
		setBuildingType(null);
		setFloorFrom('');
		setFloorTo('');
		setNotFirstFloor(false);
		setNotLastFloor(false);
		await router.push(
			`/property?input=${JSON.stringify(initialInput)}`,
			`/property?input=${JSON.stringify(initialInput)}`,
			{ scroll: false },
		);
	};

	// ── Active filter tags ───────────────────────────────────────────────────

	const getActiveFilterTags = () => {
		const tags: { label: string; onRemove: () => void }[] = [];

		if (searchFilter?.search?.options?.includes('propertyRent')) {
			tags.push({ label: 'Ijara', onRemove: () => handleListingTypeChange('sotish') });
		}

		(searchFilter?.search?.locationList ?? []).forEach((loc) => {
			tags.push({ label: loc, onRemove: () => handleLocationToggle(loc as PropertyLocation) });
		});

		((searchFilter?.search?.roomsList ?? []) as number[]).forEach((r) => {
			tags.push({ label: `${r} xona`, onRemove: () => handleRoomToggle(r) });
		});

		const ps = searchFilter?.search?.pricesRange?.start;
		const pe = searchFilter?.search?.pricesRange?.end;
		if ((ps && ps > 0) || (pe && pe > 0 && pe < 2_000_000)) {
			tags.push({
				label: `${formatPrice(ps ?? 0)} – ${formatPrice(pe ?? 2_000_000)} so'm`,
				onRemove: () => pushFilter({ ...searchFilter.search, pricesRange: { start: 0, end: 2_000_000 } }),
			});
		}

		((searchFilter?.search?.typeList ?? []) as PropertyType[]).forEach((t) => {
			const found = PROPERTY_TYPES.find((pt) => pt.value === t);
			tags.push({ label: found?.label ?? t, onRemove: () => handleTypeToggle(t) });
		});

		return tags;
	};

	// ── Shared filter sections (used in both modal & mobile sheet) ───────────

	const renderLocationSection = () => (
		<div className="modal-section">
			<span className="section-label">Joylashuv</span>
			<div className="amenities-chips">
				{TASHKENT_DISTRICTS.map((loc) => (
					<button
						key={loc}
						type="button"
						className={`amenity-chip${(searchFilter?.search?.locationList ?? []).includes(loc) ? ' selected' : ''}`}
						onClick={() => handleLocationToggle(loc)}
					>
						{loc}
					</button>
				))}
			</div>
		</div>
	);

	const renderRoomsSection = (pillClass: string, pillSize?: string) => (
		<div className="modal-section">
			<span className="section-label">Xonalar</span>
			<div className={pillSize === 'large' ? 'sheet-rooms-pills' : 'rooms-pills'}>
				{[1, 2, 3, 4, 5].map((r) => (
					<button
						key={r}
						type="button"
						className={`${pillClass}${((searchFilter?.search?.roomsList ?? []) as number[]).includes(r) ? ' selected' : ''}`}
						onClick={() => handleRoomToggle(r)}
					>
						{r === 5 ? '5+' : r}
					</button>
				))}
			</div>
		</div>
	);

	const renderPriceSection = () => (
		<div className="modal-section">
			<span className="section-label">Narx</span>
			<div className="price-range-slider">
				<Slider
					value={localPrice}
					min={0}
					max={PRICE_MAX}
					step={100_000}
					onChange={(_, v) => setLocalPrice(v as [number, number])}
					onChangeCommitted={handleSliderCommit}
					sx={{
						color: '#1246e6',
						height: 4,
						'& .MuiSlider-thumb': {
							width: 20,
							height: 20,
							backgroundColor: '#fff',
							border: '2px solid #1246e6',
							boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
							'&:hover, &.Mui-focusVisible': {
								boxShadow: '0 4px 24px rgba(18,70,230,0.25)',
							},
						},
						'& .MuiSlider-rail': {
							backgroundColor: '#e5e7eb',
							opacity: 1,
						},
					}}
				/>
			</div>
			<div className="price-inputs">
				<div className="price-input-group">
					<label>dan</label>
					<div className="price-input-wrapper">
						<input
							type="number"
							value={localPrice[0] || ''}
							placeholder="0"
							onChange={(e) => {
								const v = Number(e.target.value) || 0;
								setLocalPrice([v, localPrice[1]]);
								handlePriceInputChange(e.target.value, 'start');
							}}
						/>
						<span className="price-suffix">so'm</span>
					</div>
				</div>
				<div className="price-input-group">
					<label>gacha</label>
					<div className="price-input-wrapper">
						<input
							type="number"
							value={localPrice[1] || ''}
							placeholder="2 000 000"
							onChange={(e) => {
								const v = Number(e.target.value) || 0;
								setLocalPrice([localPrice[0], v]);
								handlePriceInputChange(e.target.value, 'end');
							}}
						/>
						<span className="price-suffix">so'm</span>
					</div>
				</div>
			</div>
			<div className="price-presets">
				{PRICE_PRESETS.map(({ label, value }) => (
					<button
						key={label}
						type="button"
						className={`price-preset${localPrice[1] === value ? ' active' : ''}`}
						onClick={() => handlePresetPrice(value)}
					>
						{label}
					</button>
				))}
			</div>
		</div>
	);

	const renderPropertyTypeSection = () => (
		<div className="modal-section">
			<span className="section-label">Mulk turi</span>
			<div className="property-type-grid">
				{PROPERTY_TYPES.map((pt) => {
					const isApiType = pt.value === PropertyType.APARTMENT || pt.value === PropertyType.HOUSE || pt.value === PropertyType.VILLA;
					const isSelected = isApiType && ((searchFilter?.search?.typeList ?? []) as PropertyType[]).includes(pt.value as PropertyType);
					return (
						<button
							key={pt.value}
							type="button"
							className={`property-type-card${isSelected ? ' selected' : ''}`}
							onClick={() => isApiType && handleTypeToggle(pt.value as PropertyType)}
						>
							<span className="type-icon">{pt.icon}</span>
							<span className="type-label">{pt.label}</span>
						</button>
					);
				})}
			</div>
		</div>
	);

	const renderAmenitiesSection = () => (
		<div className="modal-section">
			<span className="section-label">Qo'shimcha imkoniyatlar</span>
			<div className="amenities-chips">
				{AMENITIES.map((a) => (
					<button
						key={a}
						type="button"
						className={`amenity-chip${amenities.includes(a) ? ' selected' : ''}`}
						onClick={() => setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]))}
					>
						{a}
					</button>
				))}
			</div>
		</div>
	);

	const advancedFilterCount = getAdvancedFilterCount();
	const activeFilterTags = getActiveFilterTags();
	const listingType = getListingType();

	// ── Mobile bottom-sheet render ────────────────────────────────────────────

	if (isMobile) {
		return (
			<div className="filter-mobile-sheet">
				{/* Listing type tabs */}
				<div>
					<span
						style={{
							display: 'block',
							marginBottom: '12px',
							fontFamily: "'Plus Jakarta Sans', sans-serif",
							fontWeight: 600,
							fontSize: '16px',
							color: '#1f2937',
						}}
					>
						Tur
					</span>
					<div className="sheet-listing-tabs">
						{(['ijara', 'sotish', 'yangi'] as ListingType[]).map((t) => (
							<button
								key={t}
								type="button"
								className={`sheet-tab${listingType === t ? ' active' : ''}`}
								onClick={() => handleListingTypeChange(t)}
							>
								{t === 'ijara' ? 'Ijara' : t === 'sotish' ? 'Sotish' : 'Yangi bino'}
							</button>
						))}
					</div>
				</div>

				{renderLocationSection()}
				{renderRoomsSection('sheet-room-pill', 'large')}
				{renderPriceSection()}
				{renderPropertyTypeSection()}
				{renderAmenitiesSection()}

				{/* Condition */}
				<div className="modal-section">
					<span className="section-label">Holati</span>
					<div className="condition-pills">
						{CONDITIONS.map((c) => (
							<button
								key={c}
								type="button"
								className={`condition-pill${condition === c ? ' selected' : ''}`}
								onClick={() => setCondition(condition === c ? null : c)}
							>
								{c}
							</button>
						))}
					</div>
				</div>

				{/* Building type */}
				<div className="modal-section">
					<span className="section-label">Bino turi</span>
					<div className="amenities-chips">
						{BUILDING_TYPES.map((b) => (
							<button
								key={b}
								type="button"
								className={`amenity-chip${buildingType === b ? ' selected' : ''}`}
								onClick={() => setBuildingType(buildingType === b ? null : b)}
							>
								{b}
							</button>
						))}
					</div>
				</div>

				{/* Footer */}
				<div className="sheet-footer">
					<button type="button" className="sheet-clear-btn" onClick={handleRefresh}>
						Filtrllarni tozalash
					</button>
					<button type="button" className="sheet-apply-btn" onClick={() => onClose?.()}>
						{total > 0 ? `${total} ta e'lon ko'rish` : "Natijalarni ko'rish"}
					</button>
				</div>
			</div>
		);
	}

	// ── Desktop render ────────────────────────────────────────────────────────

	const toggleDropdown = (key: DropdownKey) => {
		setOpenDropdown((prev) => (prev === key ? null : key));
	};

	return (
		<>
			{/* ── Sticky filter bar ─────────────────────────────────────────── */}
			<div className="filter-bar-wrapper" ref={barRef}>
				<div className="filter-bar-inner">
					{/* Listing type tabs */}
					<div className="listing-type-tabs">
						{(['ijara', 'sotish', 'yangi'] as ListingType[]).map((t) => (
							<button
								key={t}
								type="button"
								className={`listing-tab${listingType === t ? ' active' : ''}`}
								onClick={() => handleListingTypeChange(t)}
							>
								{t === 'ijara' ? 'Ijara' : t === 'sotish' ? 'Sotish' : 'Yangi bino'}
							</button>
						))}
					</div>

					<div className="filter-divider" />

					{/* Location dropdown */}
					<div className="filter-dropdown">
						<button
							type="button"
							className={`filter-dropdown-trigger min-160${openDropdown === 'location' ? ' open' : ''}`}
							onClick={() => toggleDropdown('location')}
						>
							<span className="dropdown-prefix">📍</span>
							<span>{locationLabel()}</span>
							<KeyboardArrowDownIcon
								className={`dropdown-chevron${openDropdown === 'location' ? ' rotated' : ''}`}
								style={{ fontSize: 16 }}
							/>
						</button>
						{openDropdown === 'location' && (
							<div className="filter-dropdown-panel panel-location">
								<div className="dropdown-section-label">Toshkent tumanlari</div>
								{TASHKENT_DISTRICTS.map((loc) => (
									<div
										key={loc}
										className={`location-option${(searchFilter?.search?.locationList ?? []).includes(loc) ? ' selected' : ''}`}
										onClick={() => handleLocationToggle(loc)}
									>
										<span>{loc}</span>
										<span className="location-check">✓</span>
									</div>
								))}
								<div className="dropdown-section-label" style={{ marginTop: 8 }}>
									Boshqa shaharlar
								</div>
								{OTHER_LOCATIONS.map((loc) => (
									<div
										key={loc}
										className={`location-option${(searchFilter?.search?.locationList ?? []).includes(loc) ? ' selected' : ''}`}
										onClick={() => handleLocationToggle(loc)}
									>
										<span>{loc}</span>
										<span className="location-check">✓</span>
									</div>
								))}
							</div>
						)}
					</div>

					{/* Price range dropdown */}
					<div className="filter-dropdown">
						<button
							type="button"
							className={`filter-dropdown-trigger min-180${openDropdown === 'price' ? ' open' : ''}`}
							onClick={() => toggleDropdown('price')}
						>
							<span>{priceLabel()}</span>
							<KeyboardArrowDownIcon
								className={`dropdown-chevron${openDropdown === 'price' ? ' rotated' : ''}`}
								style={{ fontSize: 16 }}
							/>
						</button>
						{openDropdown === 'price' && (
							<div className="filter-dropdown-panel panel-price">
								<div className="price-range-slider">
									<Slider
										value={localPrice}
										min={0}
										max={PRICE_MAX}
										step={100_000}
										onChange={(_, v) => setLocalPrice(v as [number, number])}
										onChangeCommitted={handleSliderCommit}
										sx={{
											color: '#1246e6',
											height: 4,
											'& .MuiSlider-thumb': {
												width: 20,
												height: 20,
												backgroundColor: '#fff',
												border: '2px solid #1246e6',
												boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
												'&:hover, &.Mui-focusVisible': {
													boxShadow: '0 4px 24px rgba(18,70,230,0.25)',
												},
											},
											'& .MuiSlider-rail': {
												backgroundColor: '#e5e7eb',
												opacity: 1,
											},
										}}
									/>
								</div>
								<div className="price-inputs">
									<div className="price-input-group">
										<label>dan</label>
										<div className="price-input-wrapper">
											<input
												type="number"
												value={localPrice[0] || ''}
												placeholder="0"
												onChange={(e) => {
													const v = Number(e.target.value) || 0;
													setLocalPrice([v, localPrice[1]]);
													handlePriceInputChange(e.target.value, 'start');
												}}
											/>
											<span className="price-suffix">so'm</span>
										</div>
									</div>
									<div className="price-input-group">
										<label>gacha</label>
										<div className="price-input-wrapper">
											<input
												type="number"
												value={localPrice[1] || ''}
												placeholder="2 000 000"
												onChange={(e) => {
													const v = Number(e.target.value) || 0;
													setLocalPrice([localPrice[0], v]);
													handlePriceInputChange(e.target.value, 'end');
												}}
											/>
											<span className="price-suffix">so'm</span>
										</div>
									</div>
								</div>
								<div className="price-presets">
									{PRICE_PRESETS.map(({ label, value }) => (
										<button
											key={label}
											type="button"
											className={`price-preset${localPrice[1] === value ? ' active' : ''}`}
											onClick={() => handlePresetPrice(value)}
										>
											{label}
										</button>
									))}
								</div>
							</div>
						)}
					</div>

					{/* Rooms dropdown */}
					<div className="filter-dropdown">
						<button
							type="button"
							className={`filter-dropdown-trigger min-140${openDropdown === 'rooms' ? ' open' : ''}`}
							onClick={() => toggleDropdown('rooms')}
						>
							<span>{roomsLabel()}</span>
							<KeyboardArrowDownIcon
								className={`dropdown-chevron${openDropdown === 'rooms' ? ' rotated' : ''}`}
								style={{ fontSize: 16 }}
							/>
						</button>
						{openDropdown === 'rooms' && (
							<div className="filter-dropdown-panel panel-rooms">
								<div className="rooms-pills">
									{[1, 2, 3, 4, 5].map((r) => (
										<button
											key={r}
											type="button"
											className={`room-pill${((searchFilter?.search?.roomsList ?? []) as number[]).includes(r) ? ' selected' : ''}`}
											onClick={() => handleRoomToggle(r)}
										>
											{r === 5 ? '5+' : r}
										</button>
									))}
								</div>
							</div>
						)}
					</div>

					{/* More filters button */}
					<button
						type="button"
						className="more-filters-btn"
						onClick={() => {
							setOpenDropdown(null);
							setShowAdvancedModal(true);
						}}
					>
						<TuneIcon style={{ fontSize: 16 }} />
						<span>Ko'proq filtrlar</span>
						{advancedFilterCount > 0 && (
							<span className="filter-count-badge">{advancedFilterCount}</span>
						)}
					</button>

					{/* Sort dropdown — far right */}
					<div className="filter-dropdown sort-dropdown">
						<button
							type="button"
							className={`filter-dropdown-trigger min-180${openDropdown === 'sort' ? ' open' : ''}`}
							onClick={() => toggleDropdown('sort')}
						>
							<span>Saralash: {getSortLabel()}</span>
							<KeyboardArrowDownIcon
								className={`dropdown-chevron${openDropdown === 'sort' ? ' rotated' : ''}`}
								style={{ fontSize: 16 }}
							/>
						</button>
						{openDropdown === 'sort' && (
							<div className="filter-dropdown-panel panel-sort">
								{SORT_OPTIONS.map((opt) => {
									const isSelected =
										searchFilter?.sort === opt.sort && searchFilter?.direction === opt.direction;
									return (
										<div
											key={opt.id}
											className={`sort-option${isSelected ? ' selected' : ''}`}
											onClick={() => handleSortChange(opt)}
										>
											<span>{opt.label}</span>
											{isSelected && <CheckIcon className="sort-check" style={{ fontSize: 16 }} />}
										</div>
									);
								})}
							</div>
						)}
					</div>
				</div>

				{/* Active filters strip */}
				{activeFilterTags.length > 0 && (
					<div className="active-filters-strip">
						{activeFilterTags.map((tag, i) => (
							<span key={i} className="active-filter-tag">
								{tag.label}
								<button type="button" className="tag-remove" onClick={tag.onRemove}>
									×
								</button>
							</span>
						))}
						<button type="button" className="clear-all-link" onClick={handleRefresh}>
							Hammasini tozalash
						</button>
					</div>
				)}
			</div>

			{/* ── Results header ─────────────────────────────────────────────── */}
			<div className="results-header">
				<div className="results-info">
					<p className="results-count">{total} ta e'lon topildi</p>
					<p className="results-subtitle">
						{searchFilter?.search?.locationList?.length
							? searchFilter.search.locationList.join(', ')
							: 'Barcha joylashuv'}
						{' · '}
						{listingType === 'ijara' ? 'Ijara' : 'Sotish'}
					</p>
				</div>
				<div className="view-toggle">
					<button
						type="button"
						className={`view-btn${viewMode === 'grid' ? ' active' : ''}`}
						onClick={() => onViewChange?.('grid')}
						title="Grid ko'rinishi"
					>
						<GridViewIcon style={{ fontSize: 20 }} />
					</button>
					<button
						type="button"
						className={`view-btn${viewMode === 'list' ? ' active' : ''}`}
						onClick={() => onViewChange?.('list')}
						title="Ro'yxat ko'rinishi"
					>
						<ViewListIcon style={{ fontSize: 20 }} />
					</button>
				</div>
			</div>

			{/* ── Advanced filters modal ────────────────────────────────────── */}
			{showAdvancedModal && (
				<div
					className="advanced-modal-overlay"
					onClick={(e) => {
						if (e.target === e.currentTarget) setShowAdvancedModal(false);
					}}
				>
					<div className="advanced-modal">
						<div className="modal-header">
							<span className="modal-title">Kengaytirilgan filtrlar</span>
							<button type="button" className="modal-close" onClick={() => setShowAdvancedModal(false)}>
								<CloseIcon />
							</button>
						</div>

						<div className="modal-body">
							{renderPropertyTypeSection()}

							{/* Condition */}
							<div className="modal-section">
								<span className="section-label">Holati</span>
								<div className="condition-pills">
									{CONDITIONS.map((c) => (
										<button
											key={c}
											type="button"
											className={`condition-pill${condition === c ? ' selected' : ''}`}
											onClick={() => setCondition(condition === c ? null : c)}
										>
											{c}
										</button>
									))}
								</div>
							</div>

							{/* Floor */}
							<div className="modal-section">
								<span className="section-label">Qavat</span>
								<div className="floor-inputs">
									<div className="floor-input">
										<label>dan</label>
										<input
											type="number"
											placeholder="1"
											value={floorFrom}
											onChange={(e) => setFloorFrom(e.target.value)}
											min={1}
										/>
									</div>
									<div className="floor-input">
										<label>gacha</label>
										<input
											type="number"
											placeholder="20"
											value={floorTo}
											onChange={(e) => setFloorTo(e.target.value)}
											min={1}
										/>
									</div>
								</div>
								<div className="floor-checkboxes">
									<label className="custom-checkbox">
										<input
											type="checkbox"
											checked={notFirstFloor}
											onChange={(e) => setNotFirstFloor(e.target.checked)}
										/>
										<span className="checkbox-box">
											<svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
												<path
													d="M2 6l3 3 5-5"
													stroke="currentColor"
													strokeWidth="1.5"
													strokeLinecap="round"
													strokeLinejoin="round"
												/>
											</svg>
										</span>
										<span className="checkbox-label">Birinchi qavat emas</span>
									</label>
									<label className="custom-checkbox">
										<input
											type="checkbox"
											checked={notLastFloor}
											onChange={(e) => setNotLastFloor(e.target.checked)}
										/>
										<span className="checkbox-box">
											<svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
												<path
													d="M2 6l3 3 5-5"
													stroke="currentColor"
													strokeWidth="1.5"
													strokeLinecap="round"
													strokeLinejoin="round"
												/>
											</svg>
										</span>
										<span className="checkbox-label">Oxirgi qavat emas</span>
									</label>
								</div>
							</div>

							{renderAmenitiesSection()}

							{/* Building type */}
							<div className="modal-section">
								<span className="section-label">Bino turi</span>
								<div className="amenities-chips">
									{BUILDING_TYPES.map((b) => (
										<button
											key={b}
											type="button"
											className={`amenity-chip${buildingType === b ? ' selected' : ''}`}
											onClick={() => setBuildingType(buildingType === b ? null : b)}
										>
											{b}
										</button>
									))}
								</div>
							</div>
						</div>

						<div className="modal-footer">
							<button
								type="button"
								className="footer-clear"
								onClick={() => {
									handleRefresh();
									setCondition(null);
									setAmenities([]);
									setBuildingType(null);
									setFloorFrom('');
									setFloorTo('');
									setNotFirstFloor(false);
									setNotLastFloor(false);
									setShowAdvancedModal(false);
								}}
							>
								Filtrllarni tozalash
							</button>
							<button type="button" className="footer-apply" onClick={() => setShowAdvancedModal(false)}>
								{total > 0 ? `${total} ta e'lon ko'rish` : "Natijalarni ko'rish"}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default FilterBar;
