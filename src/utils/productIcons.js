// Mapping nom string -> composant lucide
import {
  Shield, CircleDot, TrendingUp, Heart, HeartPulse, Lock,
  Cog, Settings, Cpu, Wind, Spline, Circle, Square, Aperture,
  Palette, Home, Armchair, Droplet,
  ClipboardCheck, Activity, BarChart3, CreditCard, Timer,
  Zap, AlertCircle, CloudRain, Scale,
  Car, Bike, Mountain, Snowflake, Truck, Waves, Ship, Caravan, Bus,
  Layers, Package,
} from 'lucide-react';

const MAP = {
  Shield, CircleDot, TrendingUp, Heart, HeartPulse, Lock,
  Cog, Settings, Cpu, Wind, Spline, Circle, Square, Aperture,
  Palette, Home, Armchair, Droplet,
  ClipboardCheck, Activity, BarChart3, CreditCard, Timer,
  Zap, AlertCircle, CloudRain, Scale,
  Car, Bike, Mountain, Snowflake, Truck, Waves, Ship, Caravan, Bus,
};

export default function getIcon(name) {
  return MAP[name] || Layers || Package;
}

export { MAP };
