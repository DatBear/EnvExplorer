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
    name: 'Red',
    className: 'theme-red'
  }];

const getThemeClass = () => {
  return themes.find(x => x.name === Environment.theme)?.className
}

export { themes, getThemeClass }
export default Theme;