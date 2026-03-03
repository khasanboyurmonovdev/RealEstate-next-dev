// Phase 4 Task 4
import React from 'react';
import PropertyCard from '../property/PropertyCard';
import { Property } from '../../types/property/property';

interface PopularPropertyCardProps {
	property: Property;
}

const PopularPropertyCard = (props: PopularPropertyCardProps) => {
	return <PropertyCard {...props} variant="default" />;
};

export default PopularPropertyCard;
