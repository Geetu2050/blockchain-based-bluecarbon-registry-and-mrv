module BlueCarbonRegistry::CarbonCreditToken {
    use std::signer;
    use std::string::{Self, String};
    use std::error;
    use aptos_framework::coin::{Self, Coin, BurnCapability, FreezeCapability, MintCapability};
    use aptos_framework::account;
    use aptos_framework::aptos_coin::AptosCoin;

    // Error codes
    const E_NOT_INITIALIZED: u64 = 1;
    const E_ALREADY_INITIALIZED: u64 = 2;
    const E_INSUFFICIENT_BALANCE: u64 = 3;
    const E_UNAUTHORIZED: u64 = 4;
    const E_INVALID_AMOUNT: u64 = 5;

    // Carbon Credit Token information
    const CARBON_CREDIT_DECIMALS: u8 = 8;
    const CARBON_CREDIT_SYMBOL: vector<u8> = b"CARBON";
    const CARBON_CREDIT_NAME: vector<u8> = b"Blue Carbon Credit";

    struct CarbonCreditToken has key {}

    struct LiquidityPool has key {
        carbon_token_reserve: u64,
        apt_reserve: u64,
        total_liquidity: u64,
        carbon_token_mint_cap: MintCapability<CarbonCreditToken>,
        carbon_token_burn_cap: BurnCapability<CarbonCreditToken>,
    }

    struct PoolInfo has key, store, copy, drop {
        carbon_token_reserve: u64,
        apt_reserve: u64,
        total_liquidity: u64,
        price_per_token: u64, // Price in APT (with 8 decimals)
    }

    struct SwapEvent has store, drop {
        buyer: address,
        apt_amount_in: u64,
        carbon_tokens_out: u64,
        timestamp: u64,
    }

    struct AddLiquidityEvent has store, drop {
        provider: address,
        carbon_tokens: u64,
        apt_amount: u64,
        liquidity_tokens: u64,
        timestamp: u64,
    }

    /// Initialize the carbon credit token and liquidity pool
    public fun initialize(account: &signer) {
        let account_addr = signer::address_of(account);
        
        // Check if already initialized
        assert!(!exists<LiquidityPool>(account_addr), error::already_exists(E_ALREADY_INITIALIZED));

        // Initialize the carbon credit token
        let (burn_cap, freeze_cap, mint_cap) = coin::initialize<CarbonCreditToken>(
            account,
            string::utf8(CARBON_CREDIT_NAME),
            string::utf8(CARBON_CREDIT_SYMBOL),
            CARBON_CREDIT_DECIMALS,
            false, // not frozen
        );

        // Create the liquidity pool
        move_to(account, LiquidityPool {
            carbon_token_reserve: 0,
            apt_reserve: 0,
            total_liquidity: 0,
            carbon_token_mint_cap: mint_cap,
            carbon_token_burn_cap: burn_cap,
        });

        // Destroy freeze capability as we don't need it
        coin::destroy_freeze_cap(freeze_cap);
    }

    /// Add liquidity to the pool (NGO deposits carbon credits and APT)
    public entry fun add_liquidity(
        account: &signer,
        carbon_token_amount: u64,
        apt_amount: u64,
    ) acquires LiquidityPool {
        let account_addr = signer::address_of(account);
        let pool = borrow_global_mut<LiquidityPool>(account_addr);
        
        assert!(carbon_token_amount > 0, error::invalid_argument(E_INVALID_AMOUNT));
        assert!(apt_amount > 0, error::invalid_argument(E_INVALID_AMOUNT));

        // Mint carbon tokens for the pool
        let carbon_tokens = coin::mint<CarbonCreditToken>(carbon_token_amount, &pool.carbon_token_mint_cap);
        
        // Transfer APT from the account to the pool
        let apt_coins = coin::withdraw<AptosCoin>(account, apt_amount);
        
        // Add to reserves
        pool.carbon_token_reserve = pool.carbon_token_reserve + carbon_token_amount;
        pool.apt_reserve = pool.apt_reserve + apt_amount;
        pool.total_liquidity = pool.total_liquidity + carbon_token_amount + apt_amount;

        // Store the carbon tokens in the pool (in practice, you'd store them in a CoinStore)
        coin::deposit(account_addr, carbon_tokens);

        // Emit event
        let timestamp = aptos_framework::timestamp::now_seconds();
        account::emit_event(
            account,
            AddLiquidityEvent {
                provider: account_addr,
                carbon_tokens: carbon_token_amount,
                apt_amount,
                liquidity_tokens: pool.total_liquidity,
                timestamp,
            }
        );
    }

    /// Swap APT for carbon credit tokens
    public entry fun swap_tokens(
        buyer: &signer,
        apt_amount_in: u64,
    ) acquires LiquidityPool {
        let buyer_addr = signer::address_of(buyer);
        let pool = borrow_global_mut<LiquidityPool>(account_addr);
        
        assert!(apt_amount_in > 0, error::invalid_argument(E_INVALID_AMOUNT));
        assert!(pool.carbon_token_reserve > 0, error::invalid_state(E_INSUFFICIENT_BALANCE));
        assert!(pool.apt_reserve > 0, error::invalid_state(E_INSUFFICIENT_BALANCE));

        // Calculate carbon tokens to give out using constant product formula
        // carbon_tokens_out = (apt_amount_in * carbon_token_reserve) / (apt_reserve + apt_amount_in)
        let carbon_tokens_out = (apt_amount_in * pool.carbon_token_reserve) / (pool.apt_reserve + apt_amount_in);
        
        assert!(carbon_tokens_out > 0, error::invalid_argument(E_INVALID_AMOUNT));
        assert!(carbon_tokens_out <= pool.carbon_token_reserve, error::invalid_state(E_INSUFFICIENT_BALANCE));

        // Transfer APT from buyer to pool
        let apt_coins = coin::withdraw<AptosCoin>(buyer, apt_amount_in);
        coin::deposit(account_addr, apt_coins);

        // Update reserves
        pool.apt_reserve = pool.apt_reserve + apt_amount_in;
        pool.carbon_token_reserve = pool.carbon_token_reserve - carbon_tokens_out;

        // Mint carbon tokens for the buyer
        let carbon_tokens = coin::mint<CarbonCreditToken>(carbon_tokens_out, &pool.carbon_token_mint_cap);
        coin::deposit(buyer_addr, carbon_tokens);

        // Emit event
        let timestamp = aptos_framework::timestamp::now_seconds();
        account::emit_event(
            buyer,
            SwapEvent {
                buyer: buyer_addr,
                apt_amount_in,
                carbon_tokens_out,
                timestamp,
            }
        );
    }

    /// Get current pool information
    public fun get_pool_info(): PoolInfo acquires LiquidityPool {
        let account_addr = @BlueCarbonRegistry;
        let pool = borrow_global<LiquidityPool>(account_addr);
        
        let price_per_token = if (pool.carbon_token_reserve > 0) {
            (pool.apt_reserve * 100000000) / pool.carbon_token_reserve // Price with 8 decimals
        } else {
            0
        };

        PoolInfo {
            carbon_token_reserve: pool.carbon_token_reserve,
            apt_reserve: pool.apt_reserve,
            total_liquidity: pool.total_liquidity,
            price_per_token,
        }
    }

    /// Get carbon token balance for an address
    public fun get_carbon_token_balance(addr: address): u64 {
        coin::balance<CarbonCreditToken>(addr)
    }

    /// Get APT balance for an address
    public fun get_apt_balance(addr: address): u64 {
        coin::balance<AptosCoin>(addr)
    }

    /// Calculate carbon tokens that would be received for a given APT amount
    public fun calculate_tokens_out(apt_amount_in: u64): u64 acquires LiquidityPool {
        let account_addr = @BlueCarbonRegistry;
        let pool = borrow_global<LiquidityPool>(account_addr);
        
        if (pool.carbon_token_reserve == 0 || pool.apt_reserve == 0) {
            return 0
        };

        (apt_amount_in * pool.carbon_token_reserve) / (pool.apt_reserve + apt_amount_in)
    }

    /// Calculate APT amount needed for a given number of carbon tokens
    public fun calculate_apt_in(carbon_tokens_out: u64): u64 acquires LiquidityPool {
        let account_addr = @BlueCarbonRegistry;
        let pool = borrow_global<LiquidityPool>(account_addr);
        
        if (pool.carbon_token_reserve == 0 || pool.apt_reserve == 0) {
            return 0
        };

        (carbon_tokens_out * pool.apt_reserve) / (pool.carbon_token_reserve - carbon_tokens_out)
    }

    #[test_only]
    public fun setup_test_environment(account: &signer) {
        initialize(account);
    }
}

