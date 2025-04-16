import React from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';

interface EventData {
	eventTitle: string;
	city: string;
	description: string;
	imageSrc: string;
}
const eventsData: EventData[] = [
	{
		eventTitle: 'Macys Thanksgiving Day Parade',
		city: 'NEWYORK',
		description:
			'Celebrate one of Americas most iconic parades with giant balloons, floats, and performances in the heart of NYC!',
		imageSrc: '/img/events/newyork.jpg',
	},
	{
		eventTitle: 'Chicago Air and Water Show',
		city: 'Chicago',
		description:
			'Watch thrilling aerial acrobatics and water stunts on the Lake Michigan shoreline in this spectacular Chicago tradition!',
		imageSrc: '/img/events/chicago.jpg',
	},
	{
		eventTitle: 'Mardi Gras Celebration',
		city: 'New Orleans',
		description:
			'Experience the electric energy of Mardi Gras in New Orleans with vibrant parades, music, and colorful beads!',
		imageSrc: '/img/events/NEWORLEANS.jpg',
	},
	{
		eventTitle: 'Seattle Seafair',
		city: 'Seattle',
		description:
			'Celebrate summer in Seattle with hydroplane races, air shows, and city-wide festivities during Seafair!',
		imageSrc: '/img/events/seattle.jpg',
	},
];

const EventCard = ({ event }: { event: EventData }) => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return <div>EVENT CARD</div>;
	} else {
		return (
			<Stack
				className="event-card"
				style={{
					backgroundImage: `url(${event?.imageSrc})`,
					backgroundSize: 'cover',
					backgroundPosition: 'center',
					backgroundRepeat: 'no-repeat',
				}}
			>
				<Box component={'div'} className={'info'}>
					<strong>{event?.city}</strong>
					<span>{event?.eventTitle}</span>
				</Box>
				<Box component={'div'} className={'more'}>
					<span>{event?.description}</span>
				</Box>
			</Stack>
		);
	}
};

const Events = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return <div>EVENT CARD</div>;
	} else {
		return (
			<Stack className={'events'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span className={'white'}>Events</span>
							<p className={'white'}>Stay connected. Discover upcoming events near you.</p>
						</Box>
					</Stack>
					<Stack className={'card-wrapper'}>
						{eventsData.map((event: EventData) => {
							return <EventCard event={event} key={event?.eventTitle} />;
						})}
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default Events;
