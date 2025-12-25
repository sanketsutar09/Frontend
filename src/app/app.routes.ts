import { Routes } from '@angular/router';
import { PropertyList } from './property-list/property-list';
import { UserSignUp } from './user-sign-up/user-sign-up';
import { CompProperties } from './comp-properties/comp-properties';
import { PropertyBookingComponent } from './property-booking/property-booking.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { FeedBackComponent } from './feed-back/feed-back.component';

export const routes: Routes = [

    {
        path:"",
        component : PropertyList 
    },
    {
        path: "UserSignUp",
        component: UserSignUp
    },
    {
        path : "uploadProperty",
        component: CompProperties
    },
    {
        path:"bookProperty/:id",
        component: PropertyBookingComponent
    },
    {
        path:"propertyList",
        component:PropertyList
    },
    {
        path:"userProfile",
        component: UserProfileComponent
    },
    {
        path: "aboutUs",
        component: AboutUsComponent
    },
    {
        path:"contactUs",
        component: ContactUsComponent
    },
    {
        path: "feedBack",
        component: FeedBackComponent
    }
];
