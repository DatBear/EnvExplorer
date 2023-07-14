import Environment from "../Environment";

type Theme = {
  name: string;
  className?: string;
}

const themes: Theme[] = [
  {
    name: 'Default',
  },
  {
    name: 'Light',
    className: 'theme-light'
  },
  {
    name: 'Red',
    className: 'theme-red'
  },
  {
    name: 'Orange',
    className: 'theme-orange'
  },
  {
    name: 'Yellow',
    className: 'theme-yellow'
  }
];

const getThemeClass = () => {
  return themes.find(x => x.name === Environment.theme)?.className
}

export { themes, getThemeClass }
export default Theme;