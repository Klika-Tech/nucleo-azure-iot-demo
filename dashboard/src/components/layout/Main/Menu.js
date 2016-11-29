import React from 'react';
import { SidebarNav, SidebarNavItem } from '@sketchpixy/rubix';

const Menu = () => (
    <div className="sidebar-nav-container">
        <SidebarNav>
            <SidebarNavItem
                name="Accelerometer" href="/accelerometer"
                glyph="icon-fontello-chart-line"
            />
        </SidebarNav>
    </div>
);

export default Menu;
