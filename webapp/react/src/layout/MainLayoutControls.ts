import { emptyFunction } from '../helpers/fillers';

export interface VisibilityHandlers {
    show: () => void,
    hide: () => void
}
interface IMainLayoutCallbacks {
    [key: string]: VisibilityHandlers
}
export const mainLayoutControls: IMainLayoutCallbacks = {
    leftSlideBar: {
        show: emptyFunction,
        hide: emptyFunction
    },
    rightSlideBar: {
        show: emptyFunction,
        hide: emptyFunction
    }
}
