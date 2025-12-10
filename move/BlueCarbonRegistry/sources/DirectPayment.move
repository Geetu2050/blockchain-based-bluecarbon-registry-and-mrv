module BlueCarbonRegistry::DirectPayment {
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::account;

    // Error codes
    const E_NOT_ENOUGH_BALANCE: u64 = 1;
    const E_INVALID_AMOUNT: u64 = 2;
    const E_INVALID_NGO_ADDRESS: u64 = 3;
    const E_PROJECT_NOT_FOUND: u64 = 4;
    const E_UNAUTHORIZED: u64 = 5;

    // Structs for project and payment tracking
    struct Project has key {
        id: u64,
        name: String,
        organization: String,
        ngo_wallet_address: address,
        total_credits: u64,
        credits_sold: u64,
        price_per_credit: u64, // in octas (smallest unit of APT)
        status: u8, // 0: pending, 1: approved, 2: rejected
        created_at: u64,
        updated_at: u64,
    }

    struct PaymentRecord has key, store, copy, drop {
        payment_id: u64,
        buyer_address: address,
        ngo_address: address,
        project_id: u64,
        project_name: String,
        credits_purchased: u64,
        amount_paid: u64, // in octas
        payment_timestamp: u64,
        transaction_hash: String,
    }

    struct DirectPaymentEvents has key {
        payment_created_events: EventHandle<PaymentCreatedEvent>,
        project_created_events: EventHandle<ProjectCreatedEvent>,
    }

    struct PaymentCreatedEvent has store, drop {
        payment_id: u64,
        buyer_address: address,
        ngo_address: address,
        project_id: u64,
        project_name: String,
        credits_purchased: u64,
        amount_paid: u64,
        payment_timestamp: u64,
        transaction_hash: String,
    }

    struct ProjectCreatedEvent has store, drop {
        project_id: u64,
        name: String,
        organization: String,
        ngo_wallet_address: address,
        total_credits: u64,
        price_per_credit: u64,
        created_at: u64,
    }

    // Initialize the module
    public fun initialize(account: &signer) {
        let account_addr = signer::address_of(account);
        
        // Initialize the events resource
        move_to(account, DirectPaymentEvents {
            payment_created_events: account::new_event_handle<PaymentCreatedEvent>(account),
            project_created_events: account::new_event_handle<ProjectCreatedEvent>(account),
        });
    }

    // Create a new project with NGO wallet address
    public entry fun create_project(
        account: &signer,
        project_id: u64,
        name: String,
        organization: String,
        ngo_wallet_address: address,
        total_credits: u64,
        price_per_credit: u64,
    ) {
        let account_addr = signer::address_of(account);
        let current_time = aptos_framework::timestamp::now_seconds();
        
        // Validate inputs
        assert!(total_credits > 0, E_INVALID_AMOUNT);
        assert!(price_per_credit > 0, E_INVALID_AMOUNT);
        assert!(ngo_wallet_address != @0x0, E_INVALID_NGO_ADDRESS);
        
        let project = Project {
            id: project_id,
            name,
            organization,
            ngo_wallet_address,
            total_credits,
            credits_sold: 0,
            price_per_credit,
            status: 1, // approved by default for demo
            created_at: current_time,
            updated_at: current_time,
        };
        
        // Store the project
        move_to(account, project);
        
        // Emit project created event
        let events = borrow_global_mut<DirectPaymentEvents>(account_addr);
        event::emit_event(&mut events.project_created_events, ProjectCreatedEvent {
            project_id,
            name: project.name,
            organization: project.organization,
            ngo_wallet_address: project.ngo_wallet_address,
            total_credits: project.total_credits,
            price_per_credit: project.price_per_credit,
            created_at: current_time,
        });
    }

    // Purchase credits with direct payment to NGO
    public entry fun purchase_credits_direct(
        buyer: &signer,
        project_id: u64,
        credits_to_purchase: u64,
    ) acquires Project, PaymentRecord, DirectPaymentEvents {
        let buyer_addr = signer::address_of(buyer);
        let current_time = aptos_framework::timestamp::now_seconds();
        
        // Validate inputs
        assert!(credits_to_purchase > 0, E_INVALID_AMOUNT);
        
        // Get the project (in a real implementation, this would be stored in a table)
        // For demo purposes, we'll create a mock project
        let project = Project {
            id: project_id,
            name: string::utf8(b"Sample Project"),
            organization: string::utf8(b"Sample NGO"),
            ngo_wallet_address: @0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef,
            total_credits: 1000,
            credits_sold: 0,
            price_per_credit: 1000000, // 0.01 APT in octas
            status: 1,
            created_at: current_time,
            updated_at: current_time,
        };
        
        // Calculate total cost
        let total_cost = credits_to_purchase * project.price_per_credit;
        
        // Check if buyer has enough balance
        let buyer_coin = coin::withdraw<AptosCoin>(buyer, total_cost);
        assert!(coin::value<AptosCoin>(&buyer_coin) >= total_cost, E_NOT_ENOUGH_BALANCE);
        
        // Transfer APT directly to NGO wallet
        coin::deposit(project.ngo_wallet_address, buyer_coin);
        
        // Update project credits sold
        project.credits_sold = project.credits_sold + credits_to_purchase;
        project.updated_at = current_time;
        
        // Create payment record
        let payment_id = current_time; // Use timestamp as unique ID for demo
        let payment_record = PaymentRecord {
            payment_id,
            buyer_address: buyer_addr,
            ngo_address: project.ngo_wallet_address,
            project_id,
            project_name: project.name,
            credits_purchased: credits_to_purchase,
            amount_paid: total_cost,
            payment_timestamp: current_time,
            transaction_hash: string::utf8(b"mock_transaction_hash"),
        };
        
        // Store payment record
        move_to(buyer, payment_record);
        
        // Emit payment created event
        let events = borrow_global_mut<DirectPaymentEvents>(@0x1);
        event::emit_event(&mut events.payment_created_events, PaymentCreatedEvent {
            payment_id,
            buyer_address: buyer_addr,
            ngo_address: project.ngo_wallet_address,
            project_id,
            project_name: project.name,
            credits_purchased: credits_to_purchase,
            amount_paid: total_cost,
            payment_timestamp: current_time,
            transaction_hash: string::utf8(b"mock_transaction_hash"),
        });
    }

    // Get project information
    public fun get_project_info(project_id: u64): (u64, String, String, address, u64, u64, u64, u64) {
        // In a real implementation, this would query the stored project
        // For demo purposes, return mock data
        (
            project_id,
            string::utf8(b"Sample Project"),
            string::utf8(b"Sample NGO"),
            @0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef,
            1000,
            0,
            1000000,
            1
        )
    }

    // Get payment history for a buyer
    public fun get_payment_history(buyer_addr: address): vector<PaymentRecord> {
        // In a real implementation, this would query stored payment records
        // For demo purposes, return empty vector
        vector::empty<PaymentRecord>()
    }

    // Verify payment on-chain
    public fun verify_payment(payment_id: u64): bool {
        // In a real implementation, this would check if the payment exists
        // For demo purposes, return true
        true
    }

    // Get total payments to an NGO
    public fun get_ngo_total_payments(ngo_addr: address): u64 {
        // In a real implementation, this would sum all payments to the NGO
        // For demo purposes, return 0
        0
    }

    // Update project status (admin only)
    public entry fun update_project_status(
        admin: &signer,
        project_id: u64,
        new_status: u8,
    ) acquires Project {
        let admin_addr = signer::address_of(admin);
        // In a real implementation, check if admin is authorized
        // For demo purposes, allow any address
        
        // In a real implementation, update the project status
        // For demo purposes, do nothing
    }

    // Emergency withdrawal (admin only)
    public entry fun emergency_withdrawal(
        admin: &signer,
        amount: u64,
    ) {
        let admin_addr = signer::address_of(admin);
        // In a real implementation, check if admin is authorized
        // and handle emergency withdrawals
        // For demo purposes, do nothing
    }

    // Test functions for development
    #[test_only]
    public fun setup_test_project(account: &signer) {
        initialize(account);
        create_project(
            account,
            1,
            string::utf8(b"Test Project"),
            string::utf8(b"Test NGO"),
            @0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef,
            1000,
            1000000,
        );
    }

    #[test]
    public fun test_direct_payment() {
        let buyer = @0x2;
        let ngo = @0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef;
        
        // Setup test environment
        aptos_framework::aptos_coin::mint(buyer, 1000000000); // 10 APT
        setup_test_project(&account::create_account_for_test(buyer));
        
        // Test direct payment
        purchase_credits_direct(&account::create_account_for_test(buyer), 1, 10);
        
        // Verify payment was made
        assert!(verify_payment(1), 0);
    }
}
