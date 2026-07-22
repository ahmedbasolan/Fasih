/**
 * Central icon barrel.
 *
 * Metro does NOT tree-shake in dev, so importing named icons straight from
 * 'lucide-react-native' pulls the ENTIRE ~3,390-icon set into the bundle
 * (~1,700 modules). Deep-importing each icon we actually use keeps the dev
 * bundle lean. The 'lucide-react-native/icons/<name>' subpath is resolved
 * to the physical icon file by a resolver shim in metro.config.js.
 */
export type { LucideIcon } from 'lucide-react-native';

export { default as Activity } from 'lucide-react-native/icons/activity';
export { default as ArrowLeftRight } from 'lucide-react-native/icons/arrow-left-right';
export { default as ArrowRight } from 'lucide-react-native/icons/arrow-right';
export { default as BarChart3 } from 'lucide-react-native/icons/chart-column';
export { default as Bell } from 'lucide-react-native/icons/bell';
export { default as BookOpen } from 'lucide-react-native/icons/book-open';
export { default as Bookmark } from 'lucide-react-native/icons/bookmark';
export { default as BookmarkPlus } from 'lucide-react-native/icons/bookmark-plus';
export { default as Briefcase } from 'lucide-react-native/icons/briefcase';
export { default as Building2 } from 'lucide-react-native/icons/building-2';
export { default as Calendar } from 'lucide-react-native/icons/calendar';
export { default as Car } from 'lucide-react-native/icons/car';
export { default as Check } from 'lucide-react-native/icons/check';
export { default as CheckCircle } from 'lucide-react-native/icons/circle-check-big';
export { default as CheckCircle2 } from 'lucide-react-native/icons/circle-check';
export { default as ChevronLeft } from 'lucide-react-native/icons/chevron-left';
export { default as ChevronRight } from 'lucide-react-native/icons/chevron-right';
export { default as Coffee } from 'lucide-react-native/icons/coffee';
export { default as Compass } from 'lucide-react-native/icons/compass';
export { default as CreditCard } from 'lucide-react-native/icons/credit-card';
export { default as Dumbbell } from 'lucide-react-native/icons/dumbbell';
export { default as Eye } from 'lucide-react-native/icons/eye';
export { default as EyeOff } from 'lucide-react-native/icons/eye-off';
export { default as Feather } from 'lucide-react-native/icons/feather';
export { default as Flame } from 'lucide-react-native/icons/flame';
export { default as Globe } from 'lucide-react-native/icons/globe';
export { default as Grid2x2 } from 'lucide-react-native/icons/grid-2x2';
export { default as Heart } from 'lucide-react-native/icons/heart';
export { default as Home } from 'lucide-react-native/icons/house';
export { default as Info } from 'lucide-react-native/icons/info';
export { default as Layers } from 'lucide-react-native/icons/layers';
export { default as Lock } from 'lucide-react-native/icons/lock';
export { default as LogOut } from 'lucide-react-native/icons/log-out';
export { default as Mail } from 'lucide-react-native/icons/mail';
export { default as MessageCircle } from 'lucide-react-native/icons/message-circle';
export { default as Mic } from 'lucide-react-native/icons/mic';
export { default as Monitor } from 'lucide-react-native/icons/monitor';
export { default as Moon } from 'lucide-react-native/icons/moon';
export { default as Play } from 'lucide-react-native/icons/play';
export { default as RefreshCw } from 'lucide-react-native/icons/refresh-cw';
export { default as Rocket } from 'lucide-react-native/icons/rocket';
export { default as RotateCcw } from 'lucide-react-native/icons/rotate-ccw';
export { default as Search } from 'lucide-react-native/icons/search';
export { default as Settings } from 'lucide-react-native/icons/settings';
export { default as Shield } from 'lucide-react-native/icons/shield';
export { default as ShoppingBag } from 'lucide-react-native/icons/shopping-bag';
export { default as Snail } from 'lucide-react-native/icons/snail';
export { default as Sparkles } from 'lucide-react-native/icons/sparkles';
export { default as Star } from 'lucide-react-native/icons/star';
export { default as Sun } from 'lucide-react-native/icons/sun';
export { default as Sunrise } from 'lucide-react-native/icons/sunrise';
export { default as Target } from 'lucide-react-native/icons/target';
export { default as TrendingUp } from 'lucide-react-native/icons/trending-up';
export { default as Trophy } from 'lucide-react-native/icons/trophy';
export { default as User } from 'lucide-react-native/icons/user';
export { default as Users } from 'lucide-react-native/icons/users';
export { default as Utensils } from 'lucide-react-native/icons/utensils';
export { default as Volume2 } from 'lucide-react-native/icons/volume-2';
export { default as WifiOff } from 'lucide-react-native/icons/wifi-off';
export { default as X } from 'lucide-react-native/icons/x';
export { default as Zap } from 'lucide-react-native/icons/zap';
