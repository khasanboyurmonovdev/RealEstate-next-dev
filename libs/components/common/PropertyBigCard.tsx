// Phase 4 Task 4
import React from 'react';
import PropertyCard from '../property/PropertyCard';
import { Property } from '../../types/property/property';

interface PropertyBigCardProps {
	property: Property;
	likePropertyHandler?: any;
}

const PropertyBigCard = (props: PropertyBigCardProps) => {
	return <PropertyCard {...props} variant="default" />;
};

export default PropertyBigCard;
