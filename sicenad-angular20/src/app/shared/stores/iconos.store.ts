import { Injectable } from '@angular/core';
import { faHome, faLock, faSignOutAlt, faBars, faBomb, faBook, faBusinessTime, faCalendarAlt, faCloudSun, faEdit, faFire, faFolderOpen, faFolderPlus, faGlobe, faLink, faMap, faQuestionCircle, faSearchLocation, faSitemap, faSnowflake, faTree, faUserCog, faUsers, faEye, faFileEdit, faPenToSquare, faArrowAltCircleLeft, faDownload } from '@fortawesome/free-solid-svg-icons';

@Injectable({ providedIn: 'root' })
export class IconosStore {
  faLock = faLock;
  faSignOutAlt = faSignOutAlt;
  faRecurso = faFolderOpen;
  faConsultar = faEye;
  faMas = faFolderPlus;
  faCalendario = faCalendarAlt;
  faSolicitar = faBusinessTime;
  faHome = faHome;
  faArtefacto = faBomb;
  faInfo = faQuestionCircle;
  faVista = faSearchLocation;
  faEnlace = faLink;
  faNormativa = faBook;
  faMeteo = faSnowflake;
  faCartografia = faMap;
  faMenu = faBars;
  faUser = faUserCog;
  faPrevision = faCloudSun;
  faIPI = faFire;
  faMetozonas = faGlobe;
  faUsuarios = faUsers;
  faCategorias = faTree;
  faPeticiones = faEdit;
  faUnidades = faSitemap;
  faEdit = faPenToSquare;
  faVolver = faArrowAltCircleLeft;
  faDownload = faDownload;
}
