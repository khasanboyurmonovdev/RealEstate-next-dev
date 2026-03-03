// Phase 4 Task 4
import React from 'react';
import PropertyCard from '../property/PropertyCard';
import { Property } from '../../types/property/property';

interface TopPropertyCardProps {
	property: Property;
	likePropertyHandler: any;
}

const TopPropertyCard = (props: TopPropertyCardProps) => {
	return <PropertyCard {...props} variant="default" />;
};

export default TopPropertyCard;
