#!/usr/bin/env python3
"""
Local Backend API Testing for Real-Time Cross-Chain Gas Tracker
Tests the Next.js API routes locally to verify code functionality
"""

import requests
import json
import sys
from datetime import datetime

# Local API URL
LOCAL_API_BASE = "http://localhost:3000/api"

def test_local_api_health_check():
    """Test the local API health check endpoint"""
    print("🔍 Testing Local API Health Check Endpoint...")
    
    try:
        # Test /api endpoint (without trailing slash)
        response = requests.get(f"{LOCAL_API_BASE}", timeout=10)
        
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
            
            print("✅ Local API Health Check endpoint working correctly")
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

def test_local_api_invalid_endpoint():
    """Test local API response for invalid endpoints"""
    print("\n🔍 Testing Local Invalid Endpoint Handling...")
    
    try:
        # Test invalid endpoint
        response = requests.get(f"{LOCAL_API_BASE}/invalid-endpoint", timeout=10)
        
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

def test_local_api_post_method():
    """Test local API POST method handling"""
    print("\n🔍 Testing Local POST Method Handling...")
    
    try:
        # Test POST to health endpoint
        response = requests.post(f"{LOCAL_API_BASE}", json={"test": "data"}, timeout=10)
        
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

def test_api_with_trailing_slash():
    """Test API endpoint with trailing slash"""
    print("\n🔍 Testing API Health Check with Trailing Slash...")
    
    try:
        # Test /api/ endpoint (with trailing slash)
        response = requests.get(f"{LOCAL_API_BASE}/", timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Data: {json.dumps(data, indent=2)}")
            
            # Validate response structure
            required_fields = ['message', 'timestamp', 'status']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"❌ Missing required fields: {missing_fields}")
                return False
            
            print("✅ API endpoint with trailing slash working correctly")
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

def main():
    """Run all local backend API tests"""
    print("=" * 60)
    print("🚀 Starting Local Backend API Tests for Real-Time Gas Tracker")
    print("=" * 60)
    
    tests = [
        ("Local API Health Check Endpoint", test_local_api_health_check),
        ("Local API Health Check with Trailing Slash", test_api_with_trailing_slash),
        ("Local Invalid Endpoint Handling", test_local_api_invalid_endpoint),
        ("Local POST Method Handling", test_local_api_post_method)
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
    print("📊 LOCAL TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All local backend API tests passed!")
        return True
    else:
        print("⚠️  Some local backend API tests failed!")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)