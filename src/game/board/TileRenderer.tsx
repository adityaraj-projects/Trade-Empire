import React from 'react';
import { BoardTile } from '../../types/game';
import { PropertyTile } from './PropertyTile';
import { RailwayTile } from './RailwayTile';
import { UtilityTile } from './UtilityTile';
import { TaxTile } from './TaxTile';
import { CardTile } from './CardTile';
import { CornerTile } from './CornerTile';

interface TileRendererProps {
  tile: BoardTile;
  isMortgaged: boolean;
  houseCount: number;
  ownerColor?: string;
  orientationClass: string;
  colorBarClass: string;
  children?: React.ReactNode;
}

export const TileRenderer: React.FC<TileRendererProps> = ({
  tile,
  isMortgaged,
  houseCount,
  ownerColor,
  orientationClass,
  colorBarClass,
  children,
}) => {
  switch (tile.type) {
    case 'property':
      return (
        <PropertyTile
          tile={tile}
          isMortgaged={isMortgaged}
          houseCount={houseCount}
          ownerColor={ownerColor}
          orientationClass={orientationClass}
          colorBarClass={colorBarClass}
        >
          {children}
        </PropertyTile>
      );
    case 'railway':
      return (
        <RailwayTile
          tile={tile}
          isMortgaged={isMortgaged}
          ownerColor={ownerColor}
          orientationClass={orientationClass}
        >
          {children}
        </RailwayTile>
      );
    case 'utility':
      return (
        <UtilityTile
          tile={tile}
          isMortgaged={isMortgaged}
          ownerColor={ownerColor}
          orientationClass={orientationClass}
        >
          {children}
        </UtilityTile>
      );
    case 'tax':
      return (
        <TaxTile tile={tile} orientationClass={orientationClass}>
          {children}
        </TaxTile>
      );
    case 'card':
      return (
        <CardTile tile={tile} orientationClass={orientationClass}>
          {children}
        </CardTile>
      );
    case 'start':
    case 'jail':
    case 'rest':
    case 'go_to_jail':
      return (
        <CornerTile tile={tile} orientationClass={orientationClass}>
          {children}
        </CornerTile>
      );
    default:
      return null;
  }
};
