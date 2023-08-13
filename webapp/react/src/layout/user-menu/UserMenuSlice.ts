// import {createSlice, PayloadAction} from '@reduxjs/toolkit';
// import { AccordionMenuTab } from '../../components/accordion-menu/AccordionMenu';
// import React from "react";
// import { menuTabs } from './UserMenu';
// import { traverseOrderedTree } from '../../helpers/traversers';
//
// function makeInitialMenuState(tabs: AccordionMenuTab[]): AccordionMenuTab[] {
//     const menuState: AccordionMenuTab[] = [];
//     for (let tab of tabs) {
//         const stateTab: AccordionMenuTab = {};
//         if ('expanded' in tab) {
//             stateTab['expanded'] = tab['expanded'];
//         }
//         if (tab['children'] instanceof Array) {
//             stateTab['children'] = makeInitialMenuState(tab['children']);
//         }
//         menuState.push(stateTab);
//     }
//     return menuState;
// }
// const initialState = makeInitialMenuState(menuTabs);
// console.log(initialState);
//
// function expand(state: Partial<AccordionMenuTab>[], action: PayloadAction<string | null>) {
//    
// }
//
// export const userMenuSlice = createSlice({
//     name: 'userMenu',
//     initialState,
//     reducers: {
//         expandTab: expand
//     }
// });
//
// export const {
//     expandTab
// } = userMenuSlice.actions;
export {}