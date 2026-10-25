import React from 'react';
import icons from '../../assets/material-icons/icons.json';

// Google Material Symbols Outlined, Apache-2.0. Assets/proveniência em assets/material-icons.
// Ícones acompanham o texto/aria-label do controle e ficam ocultos dos leitores de tela.
export default function MaterialIcon({name, size = 24, className = '', style, ...props}) {
  const icon = icons[name] || icons.restaurant;
  return <svg {...props} className={`material-icon ${className}`.trim()} width={size} height={size}
    viewBox={icon.viewBox} fill="currentColor" aria-hidden="true" focusable="false" style={style}>
    {icon.paths.map((d, i) => <path key={i} d={d}/>)}
  </svg>;
}

export function CategoryIcon({categoria, ...props}) {
  const text = `${categoria.id || ''} ${categoria.nome || ''} ${categoria.icone || ''}`.toLowerCase();
  const name = /bebida|drink|suco|🥤/.test(text) ? 'local_drink'
    : /pizza|🍕/.test(text) ? 'local_pizza'
    : /sobremesa|doce|sorvete|🍦|🍨/.test(text) ? 'icecream'
    : /lanche|hamb|burger|🍔/.test(text) ? 'lunch_dining'
    : /p[aã]o|padaria|🥐|🍞/.test(text) ? 'bakery_dining' : 'restaurant';
  return <MaterialIcon name={name} {...props}/>;
}

export const BarChart3 = props => <MaterialIcon name="bar_chart" {...props}/>;
export const Boxes = props => <MaterialIcon name="inventory_2" {...props}/>;
export const ClipboardList = props => <MaterialIcon name="receipt_long" {...props}/>;
export const FolderTree = props => <MaterialIcon name="category" {...props}/>;
export const LogOut = props => <MaterialIcon name="logout" {...props}/>;
export const Settings = props => <MaterialIcon name="settings" {...props}/>;
export const Users = props => <MaterialIcon name="group" {...props}/>;
export const Menu = props => <MaterialIcon name="menu" {...props}/>;
export const Store = props => <MaterialIcon name="storefront" {...props}/>;
export const X = props => <MaterialIcon name="close" {...props}/>;
export const RefreshCw = props => <MaterialIcon name="refresh" {...props}/>;
export const Eye = props => <MaterialIcon name="visibility" {...props}/>;
export const EyeOff = props => <MaterialIcon name="visibility_off" {...props}/>;
export const Search = props => <MaterialIcon name="search" {...props}/>;
export const Package = props => <MaterialIcon name="inventory_2" {...props}/>;
export const ArrowRight = props => <MaterialIcon name="arrow_forward" {...props}/>;
export const CheckCircle2 = props => <MaterialIcon name="check_circle" {...props}/>;
export const AlertCircle = props => <MaterialIcon name="error" {...props}/>;
export const Info = props => <MaterialIcon name="info" {...props}/>;
export const TriangleAlert = props => <MaterialIcon name="warning" {...props}/>;
