import React from 'react';
import { SidebarNav, SidebarNavItem } from '@sketchpixy/rubix';

const Menu = () => (
    <div className="sidebar-nav-container">
        <SidebarNav>
            <SidebarNavItem
                name="Dashboard" href="/dashboard"
                glyph="icon-fontello-th-large"
            />
            <SidebarNavItem
                name="Accelerometer" href="/accelerometer"
                glyph="icon-fontello-chart-line"
            />
        </SidebarNav>
    </div>
);

export default Menu;
