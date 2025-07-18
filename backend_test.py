#!/usr/bin/env python3
"""
Backend API Testing for Real-Time Cross-Chain Gas Tracker
Tests the Next.js API routes for health check and error handling
"""

import requests
import json
import sys
from datetime import datetime

# Get base URL from environment
BASE_URL = "https://98e5e088-118b-443f-81cc-f8f4d20c8032.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

def test_api_health_check():
    """Test the API health check endpoint"""
    print("🔍 Testing API Health Check Endpoint...")
    
    try:
        # Test /api endpoint (without trailing slash)
        response = requests.get(f"{API_BASE}", timeout=10)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Data: {json.dumps(data, indent=2)}")
            
            # Validate response structure
            required_fields = ['message', 'timestamp', 'status']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"❌ Missing required fields: {missing_fields}")
                return False
            
            if data.get('status') != 'healthy':
                print(f"❌ Expected status 'healthy', got '{data.get('status')}'")
                return False
            
            # Validate timestamp format
            try:
                datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00'))
                print("✅ Timestamp format is valid")
            except ValueError:
                print(f"❌ Invalid timestamp format: {data['timestamp']}")
                return False
            
            print("✅ API Health Check endpoint working correctly")
            return True
        else:
            print(f"❌ Expected status code 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {str(e)}")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON response: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return False

def test_api_invalid_endpoint():
    """Test API response for invalid endpoints"""
    print("\n🔍 Testing Invalid Endpoint Handling...")
    
    try:
        # Test invalid endpoint
        response = requests.get(f"{API_BASE}/invalid-endpoint", timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 404:
            data = response.json()
            print(f"Response Data: {json.dumps(data, indent=2)}")
            
            # Validate error response structure
            if 'error' in data and 'availableEndpoints' in data:
                print("✅ Invalid endpoint returns proper 404 error with available endpoints")
                return True
            else:
                print("❌ Invalid endpoint response missing required error fields")
                return False
        else:
            print(f"❌ Expected status code 404, got {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {str(e)}")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON response: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return False

def test_api_post_method():
    """Test API POST method handling"""
    print("\n🔍 Testing POST Method Handling...")
    
    try:
        # Test POST to health endpoint
        response = requests.post(f"{API_BASE}/", json={"test": "data"}, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 501:
            data = response.json()
            print(f"Response Data: {json.dumps(data, indent=2)}")
            
            # Validate POST response structure
            if 'error' in data and 'message' in data:
                print("✅ POST method returns proper 501 not implemented response")
                return True
            else:
                print("❌ POST method response missing required fields")
                return False
        else:
            print(f"❌ Expected status code 501, got {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {str(e)}")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON response: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return False

def main():
    """Run all backend API tests"""
    print("=" * 60)
    print("🚀 Starting Backend API Tests for Real-Time Gas Tracker")
    print("=" * 60)
    
    tests = [
        ("API Health Check Endpoint", test_api_health_check),
        ("Invalid Endpoint Handling", test_api_invalid_endpoint),
        ("POST Method Handling", test_api_post_method)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n📋 Running: {test_name}")
        print("-" * 40)
        
        try:
            result = test_func()
            results.append((test_name, result))
            
            if result:
                print(f"✅ {test_name}: PASSED")
            else:
                print(f"❌ {test_name}: FAILED")
                
        except Exception as e:
            print(f"❌ {test_name}: ERROR - {str(e)}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All backend API tests passed!")
        return True
    else:
        print("⚠️  Some backend API tests failed!")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)