import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../scripts')))

from points_manager import PointsManager

def test_promotion_points():
    pm = PointsManager()
    
    # Simple race with 11 starters
    results = [
        {"position": 1, "riderId": "r1", "date": "2026-03-01", "raceName": "Race 1", "category": "Access 1"},
        {"position": 2, "riderId": "r2", "date": "2026-03-01", "raceName": "Race 1", "category": "Access 1"},
    ]
    # pad to 11
    for i in range(3, 12):
        results.append({"position": i, "riderId": f"r{i}", "date": "2026-03-01", "raceName": "Race 1", "category": "Access 1"})
        
    riders = {
        "r1": {"id": "r1", "category": "Access 1"},
        "r2": {"id": "r2", "category": "Access 1"}
    }
    
    pm.assign_points_and_categories(results, riders)
    
    # R1 should have 6 points and 1 victory.
    r1_res = next(r for r in results if r["riderId"] == "r1")
    assert r1_res["promotionPoints"] == 6
    assert r1_res["isWin"] == True
    assert r1_res["challengePoints"] == 25.0  # (50 points base) / 2 because total starters (11) < 31
    
def test_quorum():
    pm = PointsManager()
    results = [
        {"position": 1, "riderId": "r1", "date": "2026-03-01", "raceName": "Race 2"},
    ]
    # pad to 10 starters exactly -> NO PROMOTION POINTS
    for i in range(2, 11):
        results.append({"position": i, "riderId": f"r{i}", "date": "2026-03-01", "raceName": "Race 2"})
        
    pm.assign_points_and_categories(results, {})
    r1_res = next(r for r in results if r["riderId"] == "r1")
    assert r1_res["promotionPoints"] == 0
    assert r1_res["isWin"] == True

if __name__ == "__main__":
    test_promotion_points()
    test_quorum()
    print("All tests passed.")
