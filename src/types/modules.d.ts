/**
 * Typové deklarace pro externí moduly
 */

/**
 * Modul on-finished pro detekci dokončení HTTP požadavku/odpovědi
 */
declare module 'on-finished' {
  import { IncomingMessage, ServerResponse } from 'http';
  
  /**
   * Callback funkce volaná po dokončení požadavku/odpovědi
   */
  type Callback = (err: Error | null, res: IncomingMessage | ServerResponse) => void;
  
  /**
   * Funkce zjišťující, zda je požadavek/odpověď dokončen
   */
  function isFinished(msg: IncomingMessage | ServerResponse): boolean;
  
  /**
   * Funkce registrující callback na dokončení požadavku/odpovědi
   */
  function onFinished(msg: IncomingMessage | ServerResponse, callback: Callback): void;
  
  export = onFinished;
}

/**
 * Modul on-headers pro zachycení události před odesláním hlaviček HTTP odpovědi
 */
declare module 'on-headers' {
  import { ServerResponse } from 'http';
  
  /**
   * Callback funkce volaná před odesláním hlaviček odpovědi
   */
  type Listener = () => void;
  
  /**
   * Funkce registrující callback pro zachycení události před odesláním hlaviček
   */
  function onHeaders(res: ServerResponse, listener: Listener): void;
  
  export = onHeaders;
}