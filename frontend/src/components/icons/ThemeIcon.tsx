import type { ComponentType } from 'react';
import {
  AlertCircle, ArrowLeft, Building2, Check, CheckCircle2, Clock, Database,
  FilePenLine, FileText, HelpCircle, Image, Images, Inbox, Info, LayoutDashboard,
  ListChecks, LogIn, LogOut, PackageCheck, PlusCircle, RotateCcw, Shield, ShieldAlert,
  Smartphone, Store, UserPlus,
} from 'lucide-react';
import * as line from './boutique';
import * as badges from './atelier';
import * as services from './services/EngravedServiceIcons';
import * as menu from './services/EngravedMenuIcons';
import * as account from './account/EngravedAccountIcons';
import * as admin from './admin/EngravedAdminIcons';
import type { AtelierBadgeProps } from './atelier/AtelierBadges';
import type { BoutiqueIconProps } from './boutique/BoutiqueNav';
import '../../theme/icons.css';

function outline<Props extends BoutiqueIconProps>(Graphic: ComponentType<Props>) {
  return (props: Props) => (
    <Graphic
      {...props}
      strokeWidth={props.strokeWidth ?? 1.7}
      className={`theme-line-icon ${props.className ?? ''}`}
      data-theme-icon="line"
      aria-hidden={props['aria-hidden'] ?? (!props['aria-label'] && !props['aria-labelledby'])}
      focusable="false"
    />
  );
}

function badge<Props extends AtelierBadgeProps>(Graphic: ComponentType<Props>) {
  return (props: Props) => (
    <Graphic
      {...props}
      aria-hidden={props['aria-hidden'] ?? (!props['aria-label'] && !props['aria-labelledby'])}
      focusable="false"
    />
  );
}

// Map each role to the graphic selected for this theme.
export const ThemeIcon = {
  search: outline(line.BoutiqueSearchIcon),
  cart: outline(line.BoutiqueBagIcon),
  settings: outline(line.BoutiqueSettingsIcon),
  close: outline(line.BoutiqueCloseIcon),
  back: outline(line.BoutiqueChevronLeft),
  forward: outline(line.BoutiqueChevronRight),
  favorite: outline(line.BoutiqueHeartIcon),
  calendar: outline(line.BoutiqueCalendarIcon),
  notifications: outline(line.BoutiqueBellIcon),
  increase: outline(line.BoutiquePlusIcon),
  remove: outline(line.BoutiqueTrashIcon),
  trendUp: outline(line.BoutiqueTrendUp),
  trendDown: outline(line.BoutiqueTrendDown),
  revealPassword: outline(line.BoutiqueEyeIcon),
  hidePassword: outline(line.BoutiqueEyeOffIcon),
  email: outline(line.BoutiqueMailIcon),
  password: outline(line.BoutiqueKeyIcon),
  lock: outline(line.BoutiqueLockIcon),
  camera: outline(line.BoutiqueCameraIcon),
  upload: outline(line.BoutiqueImageUploadIcon),
  people: outline(line.BoutiqueUsersIcon),
  chat: outline(line.BoutiqueChatBubbleIcon),
  send: outline(line.BoutiqueSendIcon),
  spreadsheet: outline(line.BoutiqueExcelIcon),

  alert: outline(AlertCircle),
  returnArrow: outline(ArrowLeft),
  organization: outline(Building2),
  check: outline(Check),
  success: outline(CheckCircle2),
  clock: outline(Clock),
  database: outline(Database),
  editFile: outline(FilePenLine),
  document: outline(FileText),
  help: outline(HelpCircle),
  image: outline(Image),
  gallery: outline(Images),
  inbox: outline(Inbox),
  info: outline(Info),
  dashboard: outline(LayoutDashboard),
  checklist: outline(ListChecks),
  signIn: outline(LogIn),
  signOut: outline(LogOut),
  packageReady: outline(PackageCheck),
  add: outline(PlusCircle),
  refresh: outline(RotateCcw),
  shield: outline(Shield),
  securityAlert: outline(ShieldAlert),
  phone: outline(Smartphone),
  store: outline(Store),
  addPerson: outline(UserPlus),

  rent: services.EngravedDressIcon,
  buy: services.EngravedBagIcon,
  sell: services.EngravedHandshakeIcon,
  gift: services.EngravedGiftIcon,
  rentGuide: menu.EngravedHangerIcon,
  discount: menu.EngravedTagIcon,
  newArrivals: menu.EngravedClockIcon,
  membership: menu.EngravedMembershipIcon,
  care: menu.EngravedCareIcon,
  buyback: menu.EngravedBuybackIcon,
  invitation: menu.EngravedInviteIcon,
  crown: account.EngravedCrownEmblem,
  adminShield: account.EngravedShieldAdmin,
  profileCrest: account.EngravedProfileCrest,
  displayPreference: account.EngravedSparkleTier,
  adminConsignment: admin.EngravedAdminHandshake,
  authenticSeal: badge(badges.AtelierAuthenticSeal),
  orderComplete: badge(badges.AtelierOrderCompleteCrest),
  conditionGrade: badge(badges.AtelierGradeMedal),
  vipCrest: badge(badges.AtelierVipCrest),
  adminEmblem: badge(badges.AtelierAdminShieldEmblem),
};
