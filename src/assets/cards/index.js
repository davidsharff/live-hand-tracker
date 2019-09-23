import clubs from './clubs';
import diamonds from './diamonds';
import hearts from './hearts';
import spades from './spades';

export default {
  ...hearts,
  ...clubs,
  ...diamonds,
  ...spades
};