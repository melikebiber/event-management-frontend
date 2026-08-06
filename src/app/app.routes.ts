import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Events } from './pages/events/events';
import { EventDetail } from './pages/event-detail/event-detail';
import { Admin } from './pages/admin/admin';
import { MyEvents } from './pages/my-events/my-events';
import { Profile } from './pages/profile/profile';
import { adminGuard } from './guards/admin-guard';
import { AdminEventForm} from './pages/admin-event-form/admin-event-form';

export const routes: Routes = [
  {
    path: '',
    component: Home
  },
  {
    path: 'login', //Adres /login olduğunda Login componentini göster.
    component: Login
  },
  {
    path: 'register',
    component: Register
  },
  {
    path: 'events',
    component: Events
  },
  {
    path: 'events/:id',
    component: EventDetail
  },
  {
  path: 'admin',
  component: Admin,
  canActivate: [adminGuard] //Bu route’u açmadan önce belirtilen guardı çalıştır.
},
{
  path: 'admin/events/new',
  component: AdminEventForm,
  canActivate: [adminGuard]
},
  {
  path: 'my-events',
  component: MyEvents
},
  {
  path: 'profile',
  component: Profile
},
{
  path: 'admin/events/:eventId/edit',
  component: AdminEventForm,
  canActivate: [adminGuard]
},
{
  path: 'my-ratings',
  loadComponent: () =>
    import('./pages/my-ratings/my-ratings')
      .then(m => m.MyRatings)
}
];